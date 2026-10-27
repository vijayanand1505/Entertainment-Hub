import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Snackbar } from "@material-ui/core";
import { useLocation } from "react-router-dom";
import {
  COLLECTIONS_KEY,
  collectionError,
  collectionsReducer,
  parseCollections,
} from "../utils/collections";
import { normalizeTitle } from "../utils/library";
import CollectionPicker from "../components/CollectionPicker";

const CollectionsContext = createContext(null);
function read() {
  try {
    return parseCollections(localStorage.getItem(COLLECTIONS_KEY));
  } catch {
    return [];
  }
}
export function CollectionsProvider({ children }) {
  const [collections, setCollections] = useState(read);
  const current = useRef(collections);
  const [persistent, setPersistent] = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleted, setDeleted] = useState(null);
  const location = useLocation();
  const commit = useCallback((action) => {
    const next = collectionsReducer(current.current, {
      timestamp: Date.now(),
      ...action,
    });
    current.current = next;
    setCollections(next);
    try {
      localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next));
      setPersistent(true);
    } catch {
      setPersistent(false);
    }
  }, []);
  useEffect(() => {
    const sync = (event) => {
      if (event.key !== COLLECTIONS_KEY && event.key !== null) return;
      const next = parseCollections(event.newValue);
      current.current = next;
      setCollections(next);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    setSelected(null);
  }, [location.key]);
  const saveCollection = useCallback(
    (draft, id) => {
      const error = collectionError(current.current, draft, id);
      if (error) return { error };
      if (id && !current.current.some((entry) => entry.id === id))
        return { error: "This collection was removed in another tab." };
      const nextId =
        id ||
        window.crypto?.randomUUID?.() ||
        `collection-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      commit({ type: "UPSERT", id: nextId, draft });
      return { id: nextId };
    },
    [commit],
  );
  const toggleTitle = useCallback(
    (id, item) => {
      commit({ type: "TOGGLE", id, item });
    },
    [commit],
  );
  const deleteCollection = useCallback(
    (id) => {
      const entry = current.current.find((collection) => collection.id === id);
      if (!entry) return;
      commit({ type: "DELETE", id });
      setDeleted(entry);
    },
    [commit],
  );
  const openCollections = useCallback((item) => {
    setSelected(normalizeTitle(item));
  }, []);
  const value = useMemo(
    () => ({
      collections,
      persistent,
      saveCollection,
      toggleTitle,
      deleteCollection,
      openCollections,
    }),
    [
      collections,
      persistent,
      saveCollection,
      toggleTitle,
      deleteCollection,
      openCollections,
    ],
  );
  return (
    <CollectionsContext.Provider value={value}>
      {children}
      <CollectionPicker
        item={selected}
        onClose={() => setSelected(null)}
        collections={collections}
        persistent={persistent}
        onCreate={saveCollection}
        onToggle={toggleTitle}
      />
      <Snackbar
        open={Boolean(deleted)}
        autoHideDuration={6000}
        className="library-toast"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        message={deleted ? `“${deleted.name}” deleted` : ""}
        onClose={(_, reason) => {
          if (reason !== "clickaway") setDeleted(null);
        }}
        action={
          <>
            <button
              className="toast-undo"
              onClick={() => {
                commit({ type: "RESTORE", entry: deleted });
                setDeleted(null);
              }}
            >
              Undo
            </button>
            <button
              className="toast-close"
              aria-label="Dismiss collection notification"
              onClick={() => setDeleted(null)}
            >
              ×
            </button>
          </>
        }
      />
    </CollectionsContext.Provider>
  );
}
export function useCollections() {
  const value = useContext(CollectionsContext);
  if (!value) throw new Error("useCollections requires CollectionsProvider");
  return value;
}
