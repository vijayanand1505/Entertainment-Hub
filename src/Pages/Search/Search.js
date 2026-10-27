import "./Search.css";
import SearchRoundedIcon from "@material-ui/icons/SearchRounded";
import ArrowForwardRoundedIcon from "@material-ui/icons/ArrowForwardRounded";
import { useEffect, useRef, useState } from "react";
import CustomPagination from "../../components/Pagination/CustomPagination";
import CatalogGrid from "../../components/CatalogGrid";
import useCatalog from "../../hooks/useCatalog";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import { img_300, unavailable } from "../../config/config";

const favorites = [
  "Interstellar",
  "Breaking Bad",
  "The Dark Knight",
  "Stranger Things",
];
const readRecent = () => {
  try {
    const saved = JSON.parse(
      localStorage.getItem("eh-recent-searches") || "[]",
    );
    return Array.isArray(saved)
      ? saved
          .filter((item) => typeof item === "string" && item.length <= 200)
          .slice(0, 6)
      : [];
  } catch {
    return [];
  }
};
export default function Search() {
  const [type, setType] = useState("movie");
  const [searchText, setSearchText] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useState(readRecent);
  const inputRef = useRef(null);
  const term = searchText.trim();
  const debounced = useDebouncedValue(term);
  const showDropdown = dropdownOpen && term.length >= 2;
  const suggestions = useCatalog(
    showDropdown && debounced === term
      ? `search/${type}?query=${encodeURIComponent(debounced)}&include_adult=false`
      : null,
  );
  const items = suggestions.content.slice(0, 6);
  const waiting = term !== debounced || suggestions.loading;
  const catalog = useCatalog(
    query
      ? `search/${type}?query=${encodeURIComponent(query)}&page=${page}&include_adult=false`
      : null,
  );
  useEffect(() => {
    setActiveIndex(-1);
  }, [term, type]);
  useEffect(() => {
    if (activeIndex >= 0)
      document
        .getElementById(`search-option-${activeIndex}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);
  const commit = (text, nextType = type) => {
    const value = text.trim();
    setQuery(value);
    setSearchText(value);
    setType(nextType);
    setPage(1);
    setDropdownOpen(false);
    setActiveIndex(-1);
    if (value) {
      const next = [
        value,
        ...recent.filter((item) => item.toLowerCase() !== value.toLowerCase()),
      ].slice(0, 6);
      setRecent(next);
      try {
        localStorage.setItem("eh-recent-searches", JSON.stringify(next));
      } catch {
        /* Search still works when storage is unavailable. */
      }
    }
  };
  const choose = (item) => {
    commit(item.title || item.name);
    inputRef.current?.focus();
  };
  const submit = (event) => {
    event.preventDefault();
    commit(searchText);
  };
  const keyDown = (event) => {
    if (event.key === "Escape") {
      setDropdownOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setDropdownOpen(true);
      if (items.length)
        setActiveIndex((index) =>
          event.key === "ArrowDown"
            ? (index + 1) % items.length
            : index <= 0
              ? items.length - 1
              : index - 1,
        );
    }
    if (
      event.key === "Enter" &&
      showDropdown &&
      !waiting &&
      activeIndex >= 0 &&
      items[activeIndex]
    ) {
      event.preventDefault();
      choose(items[activeIndex]);
    }
  };
  return (
    <div className="search-page">
      <div className="page-heading">
        <span className="eyebrow">THE NEXT GREAT STORY IS OUT THERE</span>
        <h1>What are you in the mood for?</h1>
        <p>
          That film you’ve been meaning to watch. That series you can’t
          remember. Find it here.
        </p>
      </div>
      <div
        className="search-autocomplete"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setDropdownOpen(false);
        }}
      >
        <form className="search-form" onSubmit={submit} role="search">
          <SearchRoundedIcon />
          <input
            ref={inputRef}
            aria-label="Search movies or TV series"
            placeholder="Search for a movie or TV series…"
            type="search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            aria-controls={showDropdown ? "title-suggestions" : undefined}
            aria-activedescendant={
              showDropdown && activeIndex >= 0 && items[activeIndex]
                ? `search-option-${activeIndex}`
                : undefined
            }
            autoComplete="off"
            value={searchText}
            onFocus={() => setDropdownOpen(true)}
            onChange={(event) => {
              setSearchText(event.target.value);
              setDropdownOpen(true);
            }}
            onKeyDown={keyDown}
          />
          <button className="button" type="submit" disabled={!term}>
            Search
            <ArrowForwardRoundedIcon />
          </button>
        </form>
        {showDropdown && (
          <div className="search-dropdown">
            <div className="suggestion-heading">
              QUICK MATCHES<span>↑ ↓ to browse · Enter to search</span>
            </div>
            <ul
              id="title-suggestions"
              role="listbox"
              aria-label="Suggested titles"
              aria-busy={waiting}
            >
              {!waiting &&
                !suggestions.error &&
                items.map((item, index) => (
                  <li
                    key={item.id}
                    id={`search-option-${index}`}
                    role="option"
                    aria-selected={activeIndex === index}
                    className={activeIndex === index ? "active" : ""}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseMove={() => setActiveIndex(index)}
                    onClick={() => choose(item)}
                  >
                    <img
                      src={
                        item.poster_path
                          ? `${img_300}${item.poster_path}`
                          : unavailable
                      }
                      alt=""
                    />
                    <span>
                      <strong>{item.title || item.name}</strong>
                      <small>
                        {(item.release_date || item.first_air_date || "").slice(
                          0,
                          4,
                        ) || "Date to be announced"}{" "}
                        · {type === "movie" ? "Movie" : "TV Series"}
                      </small>
                    </span>
                    <ArrowForwardRoundedIcon />
                  </li>
                ))}
            </ul>
            {waiting ? (
              <p className="suggestion-status" role="status">
                Finding matching titles…
              </p>
            ) : suggestions.error ? (
              <p className="suggestion-status" role="status">
                Suggestions are unavailable. Press Enter to search.
              </p>
            ) : (
              !items.length && (
                <p className="suggestion-status" role="status">
                  No quick matches. Try another title.
                </p>
              )
            )}
          </div>
        )}
      </div>
      <div className="search-toolbar">
        <div className="period-tabs" role="group" aria-label="Search category">
          <button
            aria-pressed={type === "movie"}
            className={type === "movie" ? "active" : ""}
            onClick={() => {
              setType("movie");
              setPage(1);
            }}
          >
            Movies
          </button>
          <button
            aria-pressed={type === "tv"}
            className={type === "tv" ? "active" : ""}
            onClick={() => {
              setType("tv");
              setPage(1);
            }}
          >
            TV Series
          </button>
        </div>
        {query && (
          <span className="search-query" role="status">
            Results for <strong>“{query}”</strong>
          </span>
        )}
      </div>
      {recent.length > 0 && (
        <div className="recent-searches">
          <span>Recent searches</span>
          <div>
            {recent.map((text) => (
              <button key={text} onClick={() => commit(text)}>
                {text}
              </button>
            ))}
          </div>
          <button
            className="clear-recent"
            onClick={() => {
              setRecent([]);
              try {
                localStorage.removeItem("eh-recent-searches");
              } catch {}
            }}
          >
            Clear history
          </button>
        </div>
      )}
      {query ? (
        <CatalogGrid {...catalog} mediaType={type} />
      ) : (
        <div className="search-empty">
          <span className="search-empty-icon">
            <SearchRoundedIcon />
          </span>
          <h2>So many stories. Where to begin?</h2>
          <p>Search for a title above, or start with a crowd favorite.</p>
          <div className="search-suggestions">
            {favorites.map((text) => (
              <button
                onClick={() =>
                  commit(
                    text,
                    ["Breaking Bad", "Stranger Things"].includes(text)
                      ? "tv"
                      : "movie",
                  )
                }
                key={text}
              >
                {text}
                <span>↗</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {catalog.pages > 1 && !catalog.loading && (
        <CustomPagination
          page={page}
          setPage={setPage}
          numOfPages={catalog.pages}
        />
      )}
    </div>
  );
}
