import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import Dialog from "@material-ui/core/Dialog";
import CloseRoundedIcon from "@material-ui/icons/CloseRounded";
import ArrowBackRoundedIcon from "@material-ui/icons/ArrowBackRounded";
import TitleDetails from "../components/TitleDetails";
import "../components/ContentModal/ContentModal.css";

const TitleModalContext = createContext(null);
export function useTitleModal() {
  const open = useContext(TitleModalContext);
  if (!open) throw new Error("useTitleModal requires TitleModalProvider");
  return open;
}

export function TitleModalProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState({ id: null, type: "movie" });
  const [title, setTitle] = useState("");
  const [trail, setTrail] = useState([]);
  const location = useLocation();
  const triggerRef = useRef(null);
  const dialogRef = useRef(null);
  const headingRef = useRef(null);
  const focusTitle = useRef(false);
  const loaded = useCallback((nextTitle) => {
    setTitle(nextTitle);
    if (focusTitle.current) {
      headingRef.current?.focus({ preventScroll: true });
      focusTitle.current = false;
    }
  }, []);
  const moveTo = (next) => {
    setTrail((current) => [...current, { ...selected, title }]);
    setSelected(next);
    focusTitle.current = true;
    dialogRef.current?.scrollTo({ top: 0, behavior: "instant" });
  };
  const goBack = () => {
    setSelected(trail[trail.length - 1]);
    setTrail((current) => current.slice(0, -1));
    focusTitle.current = true;
    dialogRef.current?.scrollTo({ top: 0, behavior: "instant" });
  };
  const openTitle = useCallback((item, trigger) => {
    triggerRef.current = trigger;
    setSelected(item);
    setTrail([]);
    setTitle("");
    focusTitle.current = false;
    setOpen(true);
  }, []);
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.key]);
  return (
    <TitleModalContext.Provider value={openTitle}>
      {children}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth={false}
        onExited={() => {
          const target = triggerRef.current;
          if (target?.isConnected) target.focus({ preventScroll: true });
          else
            document
              .getElementById("main-content")
              ?.focus({ preventScroll: true });
        }}
        PaperProps={{ className: "details-dialog", ref: dialogRef }}
        aria-labelledby={`detail-title-${selected.type}-${selected.id}`}
      >
        <div className="detail-dialog-toolbar">
          {trail.length > 0 && (
            <button
              className="detail-back"
              onClick={goBack}
              aria-label={`Back to ${trail[trail.length - 1].title}`}
            >
              <ArrowBackRoundedIcon />
              <span>Back to {trail[trail.length - 1].title}</span>
            </button>
          )}
          <button
            className="detail-close"
            onClick={() => setOpen(false)}
            aria-label="Close title details"
          >
            <CloseRoundedIcon />
          </button>
        </div>
        <TitleDetails
          type={selected.type}
          id={selected.id}
          headingRef={headingRef}
          onTitleLoaded={loaded}
          onSelectRelated={moveTo}
        />
      </Dialog>
    </TitleModalContext.Provider>
  );
}
