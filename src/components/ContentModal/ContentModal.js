import { useTitleModal } from "../../context/TitleModalContext";

export default function ContentModal({
  children,
  media_type,
  id,
  triggerClassName = "media",
  label,
}) {
  const openTitle = useTitleModal();
  return (
    <button
      type="button"
      className={triggerClassName}
      aria-label={label}
      aria-haspopup="dialog"
      onClick={(event) =>
        openTitle({ id, type: media_type }, event.currentTarget)
      }
    >
      {children}
    </button>
  );
}
