import TuneRoundedIcon from "@material-ui/icons/TuneRounded";
import { LANGUAGES, RUNTIMES } from "../utils/discovery";
import "./DiscoveryFilters.css";

export default function DiscoveryFilters({ type, filters, onChange, onReset }) {
  const years = Array.from(
    { length: new Date().getFullYear() + 1 - 1888 + 1 },
    (_, index) => new Date().getFullYear() + 1 - index,
  );
  const active =
    ["language", "year", "rating", "runtime"].filter((key) =>
      Boolean(filters[key]),
    ).length +
    filters.genres.length +
    Number(Boolean(filters.providers?.length)) +
    Number(filters.sort !== "popular");
  const select = (key) => (event) => onChange({ [key]: event.target.value });
  return (
    <section className="discovery-filters" aria-label="Discovery filters">
      <div className="filter-heading">
        <span>
          <TuneRoundedIcon />
          Filter titles{active > 0 && <b>{active}</b>}
        </span>
        {active > 0 && (
          <button onClick={onReset}>
            Reset all filters <span aria-hidden="true">↺</span>
          </button>
        )}
      </div>
      <div className="filter-fields">
        <label>
          Original language
          <select
            aria-label="Original language"
            value={filters.language}
            onChange={select("language")}
          >
            <option value="">Any language</option>
            {LANGUAGES.map(([code, name]) => (
              <option value={code} key={code}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          {type === "movie" ? "Release year" : "First aired"}
          <select
            aria-label={type === "movie" ? "Release year" : "First aired"}
            value={filters.year}
            onChange={select("year")}
          >
            <option value="">Any year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <label>
          Minimum rating
          <select
            aria-label="Minimum rating"
            value={filters.rating}
            onChange={select("rating")}
          >
            <option value="">Any rating</option>
            {[6, 7, 8, 9].map((rating) => (
              <option value={rating} key={rating}>
                {rating}+ / 10
              </option>
            ))}
          </select>
        </label>
        <label>
          {type === "movie" ? "Runtime" : "Episode length"}
          <select
            aria-label={type === "movie" ? "Runtime" : "Episode length"}
            value={filters.runtime}
            onChange={select("runtime")}
          >
            <option value="">Any length</option>
            {RUNTIMES[type].map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sort by
          <select
            aria-label="Sort by"
            value={filters.sort}
            onChange={select("sort")}
          >
            <option value="popular">Most popular</option>
            <option value="rating">Highest rated</option>
            <option value="newest">Newest releases</option>
          </select>
        </label>
      </div>
      {(filters.rating || filters.sort === "rating") && (
        <p className="filter-note">
          Ratings include titles with at least 100 votes.
        </p>
      )}
    </section>
  );
}
