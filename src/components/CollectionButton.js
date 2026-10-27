import PlaylistAddRoundedIcon from "@material-ui/icons/PlaylistAddRounded";
import { useCollections } from "../context/CollectionsContext";
export default function CollectionButton({ item, compact = false }) {
  const { openCollections } = useCollections();
  return (
    <button
      type="button"
      className={compact ? "poster-quick-button" : "button button-secondary"}
      aria-label={`Organize ${item.title || item.name} in collections`}
      title="Add to collection"
      aria-haspopup="dialog"
      onClick={() => openCollections(item)}
    >
      <PlaylistAddRoundedIcon />
      {!compact && <span>Add to collection</span>}
    </button>
  );
}
