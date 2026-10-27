import { useState } from "react";
import { Link } from "react-router-dom";
import BookmarkBorderRoundedIcon from "@material-ui/icons/BookmarkBorderRounded";
import HistoryRoundedIcon from "@material-ui/icons/HistoryRounded";
import ArrowForwardRoundedIcon from "@material-ui/icons/ArrowForwardRounded";
import { useLibrary } from "../../context/LibraryContext";
import CatalogGrid from "../../components/CatalogGrid";
import LibraryTabs from "../../components/LibraryTabs";
import "./Library.css";

export default function Library({ history = false }) {
  const { watchlist, recentlyViewed, persistent, clearHistory } = useLibrary();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const items = history ? recentlyViewed : watchlist;
  const visible = items.filter(
    (item) =>
      (filter === "all" || item.media_type === filter) &&
      item.title.toLowerCase().includes(search.trim().toLowerCase()),
  );
  return (
    <div className="library-page">
      <div className="page-heading">
        <span className="eyebrow">YOUR OWN LITTLE MOVIE CORNER</span>
        <h1>
          {history
            ? "Good stories are worth revisiting."
            : "For your next movie night."}
        </h1>
        <p>
          {history
            ? "The last 30 titles you explored, ready for another look."
            : "All the movies and series you’ve saved, in one place. Pick your next great escape."}
        </p>
      </div>
      <LibraryTabs />
      <div className="library-privacy">
        <span>
          {persistent
            ? "Saved in this browser. No account needed."
            : "Browser storage is unavailable. Changes last for this visit."}
        </span>
        {history && items.length > 0 && (
          <button onClick={clearHistory}>Clear viewing history</button>
        )}
      </div>
      {items.length > 0 ? (
        <>
          <div className="library-toolbar">
            <div
              className="period-tabs"
              role="group"
              aria-label="Filter your library"
            >
              {[
                ["all", "All titles"],
                ["movie", "Movies"],
                ["tv", "TV Series"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={filter === value ? "active" : ""}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              type="search"
              aria-label="Search your library"
              placeholder="Find a saved story…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <p className="discovery-summary" role="status">
            {visible.length} {visible.length === 1 ? "title" : "titles"}
            {history
              ? ", most recently viewed first"
              : ", most recently saved first"}
          </p>
          {visible.length ? (
            <CatalogGrid content={visible} />
          ) : (
            <div className="catalog-state">
              <h2>No matching titles</h2>
              <p>Try another search or switch to All titles.</p>
              <button
                className="button"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
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
            {history ? <HistoryRoundedIcon /> : <BookmarkBorderRoundedIcon />}
          </span>
          <h2>
            {history
              ? "Your next story is waiting."
              : "Great stories belong on your list."}
          </h2>
          <p>
            {history
              ? "Open a movie or series to see it here. You can come back to its details whenever you like."
              : "Tap the bookmark on any poster, or save a title from its details. We’ll keep your picks here for later."}
          </p>
          <Link to="/" className="button">
            Discover something great
            <ArrowForwardRoundedIcon />
          </Link>
        </div>
      )}
    </div>
  );
}
