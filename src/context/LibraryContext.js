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
import {
  HISTORY_KEY,
  WATCHLIST_KEY,
  HISTORY_LIMIT,
  libraryReducer,
  normalizeTitle,
  parseTitles,
  titleKey,
} from "../utils/library";

const LibraryContext = createContext(null);
function readStored() {
  try {
    return {
      watchlist: parseTitles(localStorage.getItem(WATCHLIST_KEY)),
      recentlyViewed: parseTitles(
        localStorage.getItem(HISTORY_KEY),
        HISTORY_LIMIT,
      ),
    };
  } catch {
    return { watchlist: [], recentlyViewed: [] };
  }
}
export function LibraryProvider({ children }) {
  const [library, setLibrary] = useState(readStored);
  const current = useRef(library);
  const [persistent, setPersistent] = useState(true);
  const [notice, setNotice] = useState(null);
  const commit = useCallback((action) => {
    const next = libraryReducer(current.current, action);
    if (next === current.current) return true;
    const previous = current.current;
    current.current = next;
    setLibrary(next);
    try {
      if (next.watchlist !== previous.watchlist)
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next.watchlist));
      if (next.recentlyViewed !== previous.recentlyViewed)
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next.recentlyViewed));
      setPersistent(true);
      return true;
    } catch {
      setPersistent(false);
      return false;
    }
  }, []);
  useEffect(() => {
    const sync = (event) => {
      if (
        event.key !== null &&
        ![WATCHLIST_KEY, HISTORY_KEY].includes(event.key)
      )
        return;
      const next = { ...current.current };
      if (event.key === null || event.key === WATCHLIST_KEY)
        next.watchlist = parseTitles(event.newValue);
      if (event.key === null || event.key === HISTORY_KEY)
        next.recentlyViewed = parseTitles(event.newValue, HISTORY_LIMIT);
      current.current = next;
      setLibrary(next);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const toggleSaved = useCallback(
    (value) => {
      const item = normalizeTitle(value);
      if (!item) return;
      const existing = current.current.watchlist.find(
        (entry) => titleKey(entry) === titleKey(item),
      );
      const saved = !existing;
      const persisted = commit({
        type: "SAVE",
        item,
        saved,
        timestamp: Date.now(),
      });
      setNotice({
        id: Date.now(),
        message: persisted
          ? saved
            ? "Added to your watchlist"
            : "Removed from your watchlist"
          : "Updated for this visit. Browser storage is unavailable.",
        undo: () =>
          commit({
            type: "SAVE",
            item: existing || item,
            saved: !saved,
            timestamp: existing?.savedAt || Date.now(),
          }),
      });
    },
    [commit],
  );
  const recordView = useCallback(
    (item) => {
      commit({ type: "VIEW", item, timestamp: Date.now() });
    },
    [commit],
  );
  const clearHistory = useCallback(() => {
    const previous = current.current.recentlyViewed;
    commit({ type: "CLEAR_HISTORY" });
    setNotice({
      id: Date.now(),
      message: "Viewing history cleared",
      undo: () => commit({ type: "RESTORE_HISTORY", items: previous }),
    });
  }, [commit]);
  const value = useMemo(
    () => ({ ...library, persistent, toggleSaved, recordView, clearHistory }),
    [library, persistent, toggleSaved, recordView, clearHistory],
  );
  return (
    <LibraryContext.Provider value={value}>
      {children}
      <Snackbar
        key={notice?.id}
        open={Boolean(notice)}
        autoHideDuration={5000}
        onClose={(_, reason) => {
          if (reason !== "clickaway") setNotice(null);
        }}
        message={notice?.message || ""}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        className="library-toast"
        action={
          <>
            <button
              className="toast-undo"
              onClick={() => {
                notice?.undo();
                setNotice(null);
              }}
            >
              Undo
            </button>
            <button
              className="toast-close"
              aria-label="Dismiss notification"
              onClick={() => setNotice(null)}
            >
              ×
            </button>
          </>
        }
      />
    </LibraryContext.Provider>
  );
}
export function useLibrary() {
  const library = useContext(LibraryContext);
  if (!library) throw new Error("useLibrary requires LibraryProvider");
  return library;
}
