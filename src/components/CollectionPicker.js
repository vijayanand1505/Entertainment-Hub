import { useEffect, useState } from "react";
import { Dialog } from "@material-ui/core";
import PlaylistAddRoundedIcon from "@material-ui/icons/PlaylistAddRounded";
import CloseRoundedIcon from "@material-ui/icons/CloseRounded";
import { Link } from "react-router-dom";
import { titleKey } from "../utils/library";
import { COLLECTION_COLORS } from "../utils/collections";
import "../Pages/Collections/Collections.css";

export default function CollectionPicker({
  item,
  onClose,
  collections,
  persistent,
  onCreate,
  onToggle,
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  useEffect(() => {
    setName("");
    setError("");
    setStatus("");
  }, [item]);
  return (
    <Dialog
      open={Boolean(item)}
      onClose={onClose}
      maxWidth={false}
      style={{ zIndex: 1400 }}
      PaperProps={{ className: "collection-dialog" }}
      aria-labelledby="collection-picker-heading"
      aria-describedby="collection-picker-description"
    >
      <div className="collection-dialog-heading">
        <span className="collection-dialog-icon">
          <PlaylistAddRoundedIcon />
        </span>
        <div>
          <span className="eyebrow">A PLACE FOR EVERY STORY</span>
          <h2 id="collection-picker-heading">Add to a collection</h2>
        </div>
        <button
          className="collection-close"
          aria-label="Close collections"
          onClick={onClose}
        >
          <CloseRoundedIcon />
        </button>
      </div>
      <p
        id="collection-picker-description"
        className="collection-dialog-description"
      >
        Keep “{item?.title}” in as many collections as you like.
      </p>
      <div className="collection-picker-list">
        {!collections.length && (
          <p className="collection-help">
            Your first collection starts here. Give it a name below.
          </p>
        )}
        {collections.map((entry) => {
          const checked = Boolean(
            item &&
            entry.items.some((title) => titleKey(title) === titleKey(item)),
          );
          const full = !checked && entry.items.length >= 1000;
          return (
            <label className="collection-picker-row" key={entry.id}>
              <span
                className="collection-color-dot"
                style={{ background: COLLECTION_COLORS[entry.color] }}
              />
              <span>
                <strong>{entry.name}</strong>
                <small>
                  {entry.items.length}{" "}
                  {entry.items.length === 1 ? "title" : "titles"}
                  {full ? " · Collection full" : ""}
                </small>
              </span>
              <input
                type="checkbox"
                aria-label={entry.name}
                checked={checked}
                disabled={full}
                onChange={() => {
                  onToggle(entry.id, item);
                  setStatus(
                    checked
                      ? `Removed from ${entry.name}`
                      : `Added to ${entry.name}`,
                  );
                }}
              />
            </label>
          );
        })}
      </div>
      <form
        className="collection-create-inline"
        onSubmit={(event) => {
          event.preventDefault();
          const result = onCreate({ name, color: "ember" });
          if (result.error) {
            setError(result.error);
            return;
          }
          onToggle(result.id, item);
          setName("");
          setError("");
          setStatus(`Created ${name.trim()} and added this title`);
        }}
      >
        <label htmlFor="quick-collection-name">Create a new collection</label>
        <div>
          <input
            id="quick-collection-name"
            placeholder="Weekend movies, family night…"
            maxLength={60}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "quick-collection-error" : undefined}
          />
          <button className="button" type="submit">
            Create & add
          </button>
        </div>
        {error && (
          <p
            className="collection-error"
            id="quick-collection-error"
            role="alert"
          >
            {error}
          </p>
        )}
      </form>
      <p className="collection-help" role="status">
        {persistent
          ? status || "Changes save automatically in this browser."
          : "Browser storage is unavailable. Changes last for this visit."}
      </p>
      <div className="collection-dialog-footer">
        <Link className="text-link" to="/collections" onClick={onClose}>
          Manage collections →
        </Link>
        <button className="button" onClick={onClose}>
          Done
        </button>
      </div>
    </Dialog>
  );
}
