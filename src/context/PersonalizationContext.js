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
import { titleKey } from "../utils/library";
import {
  PERSONALIZATION_KEY,
  activeStreaming,
  normalizePersonalization,
  normalizeProvider,
  parsePersonalization,
  setTitleFeedback,
} from "../utils/personalization";

const PersonalizationContext = createContext(null);
function readStored() {
  try {
    const raw = localStorage.getItem(PERSONALIZATION_KEY);
    if (raw) return parsePersonalization(raw);
    return normalizePersonalization({
      region: localStorage.getItem("eh-watch-region"),
    });
  } catch {
    return normalizePersonalization(null);
  }
}
export function PersonalizationProvider({ children }) {
  const [state, setState] = useState(readStored);
  const current = useRef(state);
  const [persistent, setPersistent] = useState(true);
  const [notice, setNotice] = useState(null);
  const commit = useCallback((update) => {
    const next = normalizePersonalization(update(current.current));
    current.current = next;
    setState(next);
    try {
      localStorage.setItem(PERSONALIZATION_KEY, JSON.stringify(next));
      setPersistent(true);
      return true;
    } catch {
      setPersistent(false);
      return false;
    }
  }, []);
  useEffect(() => {
    const sync = (event) => {
      if (event.key !== null && event.key !== PERSONALIZATION_KEY) return;
      const next = parsePersonalization(event.newValue);
      current.current = next;
      setState(next);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const setRegion = useCallback(
    (region) => commit((s) => ({ ...s, region })),
    [commit],
  );
  const setOnlyMyServices = useCallback(
    (enabled) => commit((s) => ({ ...s, onlyMyServices: enabled })),
    [commit],
  );
  const toggleService = useCallback(
    (value) => {
      const provider = normalizeProvider(value);
      if (!provider) return;
      commit((s) => {
        const selected = s.services[s.region] || [];
        const next = selected.some((p) => p.id === provider.id)
          ? selected.filter((p) => p.id !== provider.id)
          : [...selected, provider];
        return {
          ...s,
          services: { ...s.services, [s.region]: next },
          onlyMyServices: next.length > 0,
        };
      });
    },
    [commit],
  );
  const toggleFeedback = useCallback(
    (item, kind) => {
      const before = current.current.feedback.find(
        (entry) => titleKey(entry) === titleKey(item),
      );
      const enabled = !before?.[kind];
      const persisted = commit((s) => ({
        ...s,
        feedback: setTitleFeedback(s.feedback, item, kind, enabled),
      }));
      const labels = {
        watched: enabled ? "Marked as watched" : "Removed from watched",
        liked: enabled ? "Added to liked titles" : "Removed from liked titles",
        hidden: enabled
          ? "Hidden from discovery and recommendations"
          : "Restored to discovery",
      };
      setNotice({
        message: persisted
          ? labels[kind]
          : "Updated for this visit. Browser storage is unavailable.",
        undo: () =>
          commit((s) => ({
            ...s,
            feedback: [
              ...(before ? [before] : []),
              ...s.feedback.filter(
                (entry) => titleKey(entry) !== titleKey(item),
              ),
            ],
          })),
      });
    },
    [commit],
  );
  const value = useMemo(
    () => ({
      ...state,
      streaming: activeStreaming(state),
      persistent,
      setRegion,
      setOnlyMyServices,
      toggleService,
      toggleFeedback,
    }),
    [
      state,
      persistent,
      setRegion,
      setOnlyMyServices,
      toggleService,
      toggleFeedback,
    ],
  );
  return (
    <PersonalizationContext.Provider value={value}>
      {children}
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={5000}
        className="library-toast"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={(_, reason) => {
          if (reason !== "clickaway") setNotice(null);
        }}
        message={notice?.message || ""}
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
              aria-label="Dismiss feedback notification"
              onClick={() => setNotice(null)}
            >
              ×
            </button>
          </>
        }
      />
    </PersonalizationContext.Provider>
  );
}
export function usePersonalization() {
  const value = useContext(PersonalizationContext);
  if (!value)
    throw new Error("usePersonalization requires PersonalizationProvider");
  return value;
}
