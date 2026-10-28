import { useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { Dialog } from "@material-ui/core";
import AddRoundedIcon from "@material-ui/icons/AddRounded";
import FolderOutlinedIcon from "@material-ui/icons/FolderOutlined";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import DeleteOutlineRoundedIcon from "@material-ui/icons/DeleteOutlineRounded";
import CloseRoundedIcon from "@material-ui/icons/CloseRounded";
import GroupRoundedIcon from "@material-ui/icons/GroupRounded";
import { useCollections } from "../../context/CollectionsContext";
import { COLLECTION_COLORS } from "../../utils/collections";
import { img_300, unavailable } from "../../config/config";
import LibraryTabs from "../../components/LibraryTabs";
import SingleContent from "../../components/SingleContent/SingleContent";
import "./Collections.css";

function CollectionEditor({ draft, onClose, onSave }) {
  const [values, setValues] = useState(
    draft || { name: "", description: "", color: "ember" },
  );
  const [error, setError] = useState("");
  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth={false}
      PaperProps={{ className: "collection-dialog" }}
      aria-labelledby="collection-editor-heading"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const result = onSave(values, draft?.id);
          if (result.error) setError(result.error);
          else onClose();
        }}
      >
        <div className="collection-dialog-heading">
          <div>
            <span className="eyebrow">My library</span>
            <h2 id="collection-editor-heading">
              {draft ? "Edit collection" : "Create a collection"}
            </h2>
          </div>
          <button
            type="button"
            className="collection-close"
            aria-label="Close collection editor"
            onClick={onClose}
          >
            <CloseRoundedIcon />
          </button>
        </div>
        <div className="collection-editor-fields">
          <label>
            Collection name
            <input
              autoFocus
              required
              maxLength={60}
              value={values.name}
              placeholder="Weekend movies"
              onChange={(e) => {
                setValues({ ...values, name: e.target.value });
                setError("");
              }}
            />
          </label>
          <label>
            Description <span>(optional)</span>
            <textarea
              maxLength={200}
              rows={3}
              value={values.description}
              placeholder="A little inspiration for your next movie night…"
              onChange={(e) =>
                setValues({ ...values, description: e.target.value })
              }
            />
          </label>
          <fieldset>
            <legend>Collection color</legend>
            <div className="collection-swatches">
              {Object.entries(COLLECTION_COLORS).map(([color, hex]) => (
                <label
                  key={color}
                  style={{ "--collection-color": hex }}
                  className={values.color === color ? "selected" : ""}
                >
                  <input
                    type="radio"
                    name="collection-color"
                    aria-label={color + " color"}
                    checked={values.color === color}
                    onChange={() => setValues({ ...values, color })}
                  />
                  <span aria-hidden="true">
                    {values.color === color ? "✓" : ""}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          {error && (
            <p className="collection-error" role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="collection-dialog-footer">
          <button type="button" className="text-button" onClick={onClose}>
            Cancel
          </button>
          <button className="button" type="submit">
            {draft ? "Save changes" : "Create collection"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
export default function Collections() {
  const { id } = useParams();
  const history = useHistory();
  const {
    collections,
    persistent,
    saveCollection,
    deleteCollection,
    toggleTitle,
  } = useCollections();
  const selected = collections.find((entry) => entry.id === id);
  const [editor, setEditor] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const items =
    selected?.items.filter(
      (item) =>
        (type === "all" || item.media_type === type) &&
        item.title.toLowerCase().includes(query.trim().toLowerCase()),
    ) || [];
  return (
    <div className="collections-page">
      <div className="page-heading">
        <span className="eyebrow">My library</span>
        <h1>
          {selected
            ? selected.name
            : id
              ? "Collection unavailable"
              : "Your collections"}
        </h1>
        <p>
          {selected
            ? selected.description || "Movies and series in this collection."
            : "Organize movies and series into your own lists."}
        </p>
      </div>
      <LibraryTabs />
      <div className="library-privacy">
        <span>
          {persistent
            ? "Saved in this browser. No account needed."
            : "Browser storage is unavailable. Changes last for this visit."}
        </span>
      </div>
      {id && !selected ? (
        <div className="catalog-state">
          <FolderOutlinedIcon />
          <h2>This collection isn’t here.</h2>
          <p>It may have been deleted, or saved in a different browser.</p>
          <Link to="/collections" className="button">
            View your collections
          </Link>
        </div>
      ) : selected ? (
        <>
          <div className="collection-page-actions">
            <Link className="text-link" to="/collections">
              ← All collections
            </Link>
            <div>
              {selected.items.some((item) => item.media_type === "movie") && (
                <Link
                  className="button button-secondary"
                  to={
                    "/movie-night?collection=" + encodeURIComponent(selected.id)
                  }
                >
                  <GroupRoundedIcon />
                  Start a movie night
                </Link>
              )}
              <button
                className="button button-secondary"
                onClick={() => setEditor(selected)}
              >
                <EditOutlinedIcon />
                Edit collection
              </button>
              <button
                className="button button-secondary"
                onClick={() => setRemoving(selected)}
              >
                <DeleteOutlineRoundedIcon />
                Delete
              </button>
            </div>
          </div>
          {selected.items.length > 0 ? (
            <>
              <div className="library-toolbar">
                <div
                  className="period-tabs"
                  role="group"
                  aria-label="Filter collection"
                >
                  {[
                    ["all", "All titles"],
                    ["movie", "Movies"],
                    ["tv", "TV Series"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      className={type === value ? "active" : ""}
                      aria-pressed={type === value}
                      onClick={() => setType(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <input
                  type="search"
                  aria-label="Search this collection"
                  placeholder="Search this collection…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <p className="discovery-summary" role="status">
                {items.length} {items.length === 1 ? "title" : "titles"}, most
                recently added first
              </p>
              {items.length ? (
                <div className="trending">
                  {items.map((item) => (
                    <div key={`${item.media_type}-${item.id}`}>
                      <SingleContent
                        id={item.id}
                        title={item.title}
                        poster={item.poster_path}
                        media_type={item.media_type}
                        vote_average={item.vote_average}
                        date={item.release_date}
                      />
                      <button
                        className="collection-remove"
                        aria-label={`Remove ${item.title} from ${selected.name}`}
                        onClick={() => toggleTitle(selected.id, item)}
                      >
                        <CloseRoundedIcon />
                        Remove from collection
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="catalog-state">
                  <h2>No matching titles</h2>
                  <p>Try another search or show all titles.</p>
                  <button
                    className="button"
                    onClick={() => {
                      setQuery("");
                      setType("all");
                    }}
                  >
                    Show all titles
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="library-empty">
              <span className="library-empty-icon">
                <FolderOutlinedIcon />
              </span>
              <h2>This collection is empty</h2>
              <p>
                Use the collection action on any poster or title page to add
                your first pick.
              </p>
              <Link to="/movies" className="button">
                Find something to add
              </Link>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="collection-page-actions">
            <p>
              {collections.length}{" "}
              {collections.length === 1 ? "collection" : "collections"} · Made
              for your kind of movie night
            </p>
            <button className="button" onClick={() => setEditor({})}>
              <AddRoundedIcon />
              New collection
            </button>
          </div>
          {collections.length ? (
            <div className="collection-grid">
              {collections.map((entry) => (
                <article
                  className="collection-card"
                  key={entry.id}
                  style={{
                    "--collection-color": COLLECTION_COLORS[entry.color],
                  }}
                >
                  <Link
                    to={`/collections/${entry.id}`}
                    className="collection-card-link"
                  >
                    <div className="collection-art" aria-hidden="true">
                      {entry.items.length ? (
                        entry.items.slice(0, 3).map((item) => (
                          <img
                            key={`${item.media_type}-${item.id}`}
                            src={
                              item.poster_path
                                ? img_300 + item.poster_path
                                : unavailable
                            }
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = unavailable;
                            }}
                            alt=""
                            loading="lazy"
                          />
                        ))
                      ) : (
                        <FolderOutlinedIcon />
                      )}
                    </div>
                    <div className="collection-card-copy">
                      <span>
                        {entry.items.length}{" "}
                        {entry.items.length === 1 ? "title" : "titles"}
                      </span>
                      <h2>{entry.name}</h2>
                      <p>
                        {entry.description || "View the titles in this collection."}
                      </p>
                      <strong>View collection →</strong>
                    </div>
                  </Link>
                  <div className="collection-card-tools">
                    <button
                      aria-label={`Edit ${entry.name}`}
                      title="Edit collection"
                      onClick={() => setEditor(entry)}
                    >
                      <EditOutlinedIcon />
                    </button>
                    <button
                      aria-label={`Delete ${entry.name}`}
                      title="Delete collection"
                      onClick={() => setRemoving(entry)}
                    >
                      <DeleteOutlineRoundedIcon />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="library-empty">
              <span className="library-empty-icon">
                <FolderOutlinedIcon />
              </span>
              <h2>Create your first collection</h2>
              <p>
                Group titles into lists such as “Weekend movies” or “Family night”.
              </p>
              <button className="button" onClick={() => setEditor({})}>
                <AddRoundedIcon />
                Create your first collection
              </button>
            </div>
          )}
        </>
      )}
      {editor && (
        <CollectionEditor
          key={editor.id || "new"}
          draft={editor.id ? editor : null}
          onClose={() => setEditor(null)}
          onSave={saveCollection}
        />
      )}
      <Dialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        maxWidth={false}
        PaperProps={{ className: "collection-dialog" }}
        aria-labelledby="delete-collection-heading"
      >
        <div className="collection-dialog-heading">
          <h2 id="delete-collection-heading">Delete “{removing?.name}”?</h2>
        </div>
        <p className="collection-dialog-description">
          This removes the collection and its {removing?.items.length || 0}{" "}
          titles. Your watchlist and other collections stay saved. You can undo
          after deleting.
        </p>
        <div className="collection-dialog-footer">
          <button className="text-button" onClick={() => setRemoving(null)}>
            Keep collection
          </button>
          <button
            className="button"
            onClick={() => {
              deleteCollection(removing.id);
              if (id === removing.id) history.push("/collections");
              setRemoving(null);
            }}
          >
            Delete collection
          </button>
        </div>
      </Dialog>
    </div>
  );
}
