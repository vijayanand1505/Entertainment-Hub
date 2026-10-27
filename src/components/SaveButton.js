import BookmarkBorderRoundedIcon from "@material-ui/icons/BookmarkBorderRounded";
import BookmarkRoundedIcon from "@material-ui/icons/BookmarkRounded";
import { useLibrary } from "../context/LibraryContext";
import { titleKey } from "../utils/library";

export default function SaveButton({ item, compact = false }) {
  const { watchlist, toggleSaved } = useLibrary();
  const saved = watchlist.some((entry) => titleKey(entry) === titleKey(item));
  const label = `${saved ? "Remove" : "Add"} ${item.title || item.name} ${saved ? "from" : "to"} watchlist`;
  return (
    <button
      type="button"
      className={
        compact
          ? `card-save ${saved ? "saved" : ""}`
          : `button button-secondary save-button ${saved ? "saved" : ""}`
      }
      onClick={() => toggleSaved(item)}
      aria-label={label}
      aria-pressed={saved}
      title={label}
    >
      {saved ? <BookmarkRoundedIcon /> : <BookmarkBorderRoundedIcon />}
      {!compact && (
        <span>{saved ? "In your watchlist" : "Add to watchlist"}</span>
      )}
    </button>
  );
}
