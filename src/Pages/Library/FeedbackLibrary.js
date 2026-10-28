import { useState } from "react";
import { usePersonalization } from "../../context/PersonalizationContext";
import LibraryTabs from "../../components/LibraryTabs";
import CatalogGrid from "../../components/CatalogGrid";
import StreamingServices from "../../components/StreamingServices";

export default function FeedbackLibrary() {
  const { feedback, persistent } = usePersonalization();
  const [kind, setKind] = useState("watched");
  const [search, setSearch] = useState("");
  const items = feedback.filter(
    (item) =>
      item[kind] &&
      item.title.toLowerCase().includes(search.trim().toLowerCase()),
  );
  return (
    <div className="library-page">
      <div className="page-heading">
        <span className="eyebrow">My library</span>
        <h1>My titles and services</h1>
        <p>
          Manage what you’ve watched, what you like, and titles you’ve hidden.
        </p>
      </div>
      <LibraryTabs />
      <StreamingServices />
      <p className="personalization-note">
        {persistent
          ? "Saved in this browser. No account needed."
          : "Browser storage is unavailable. Changes last for this visit."}
      </p>
      <div
        className="library-feedback-filter"
        role="group"
        aria-label="Title preferences"
      >
        {[
          ["watched", "Watched"],
          ["liked", "Liked"],
          ["hidden", "Not interested"],
        ].map(([value, label]) => (
          <button
            key={value}
            aria-pressed={kind === value}
            onClick={() => setKind(value)}
          >
            {label} ({feedback.filter((item) => item[value]).length})
          </button>
        ))}
      </div>
      <div className="library-toolbar">
        <input
          type="search"
          aria-label="Search my titles"
          placeholder="Find a title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <p className="personalization-note">
        {kind === "hidden"
          ? "These titles are hidden from discovery and recommendations. Use More actions on a poster to restore a title."
          : kind === "watched"
            ? "Watched titles are skipped in recommendations. Use More actions on a poster to change its status."
            : "Your likes help suggest similar titles on the homepage. Use More actions to remove a like."}
      </p>
      {items.length ? (
        <CatalogGrid content={items} />
      ) : (
        <div className="catalog-state">
          <h2>{search ? "No matching titles" : "No titles here yet"}</h2>
          <p>
            Change a title’s preferences from its details or the More actions
            menu on a poster.
          </p>
        </div>
      )}
    </div>
  );
}
