import { useHistory, useLocation } from "react-router-dom";
import Genres from "./Genres/Genres";
import DiscoveryFilters from "./DiscoveryFilters";
import CustomPagination from "./Pagination/CustomPagination";
import CatalogGrid from "./CatalogGrid";
import useCatalog from "../hooks/useCatalog";
import { usePersonalization } from "../context/PersonalizationContext";
import { isExcluded } from "../utils/personalization";
import StreamingServices from "./StreamingServices";
import { useState } from "react";
import {
  readDiscovery,
  discoverySearch,
  buildDiscoverPath,
} from "../utils/discovery";

export default function DiscoverCatalog({ type }) {
  const history = useHistory();
  const location = useLocation();
  const filters = readDiscovery(location.search, type);
  const { streaming, feedback, setOnlyMyServices } = usePersonalization();
  const [showWatched, setShowWatched] = useState(false);
  const applied = filters.allServices
    ? null
    : filters.providers
      ? { providers: filters.providers, region: filters.region }
      : streaming;
  const effectiveFilters = {
    ...filters,
    ...(applied || { providers: undefined, region: undefined }),
  };
  const isMovie = type === "movie";
  const catalog = useCatalog(buildDiscoverPath(type, effectiveFilters));
  const content = catalog.content.filter(
    (item) =>
      !isExcluded({ ...item, media_type: type }, feedback, !showWatched),
  );
  const update = (changes) =>
    history.push({
      pathname: location.pathname,
      search: discoverySearch({ ...effectiveFilters, page: 1, ...changes }),
    });
  return (
    <div>
      <div className="page-heading">
        <span className="eyebrow">Browse</span>
        <h1>{isMovie ? "Movies" : "TV series"}</h1>
        <p>
          {isMovie
            ? "Find movies by genre, language, year, and rating."
            : "Find series by genre, language, year, and episode length."}
        </p>
      </div>
      <DiscoveryFilters
        type={type}
        filters={effectiveFilters}
        onChange={update}
        onReset={() => {
          setOnlyMyServices(false);
          history.push(location.pathname);
        }}
      />
      <StreamingServices
        onChange={() =>
          update({
            providers: undefined,
            region: undefined,
            allServices: undefined,
          })
        }
      />
      {filters.providers && (
        <p className="personalization-note">
          This shared view uses {filters.providers.length} selected services in{" "}
          {filters.region}. Change My streaming services to use your own
          preferences.{" "}
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setOnlyMyServices(false);
              update({
                providers: undefined,
                region: undefined,
                allServices: true,
              });
            }}
          >
            Show all services
          </button>
        </p>
      )}
      <label className="personalization-check">
        <input
          type="checkbox"
          checked={showWatched}
          onChange={(e) => setShowWatched(e.target.checked)}
        />
        Show watched titles
      </label>
      <Genres
        type={type}
        selectedGenres={filters.genres.map((id) => ({ id: Number(id) }))}
        setSelectedGenres={(genres) =>
          update({ genres: genres.map((genre) => String(genre.id)) })
        }
      />
      <p className="discovery-summary" role="status">
        {catalog.loading
          ? "Loading titles…"
          : catalog.error
            ? "Couldn’t load titles. Please try again."
            : `${catalog.total.toLocaleString()} ${isMovie ? "movies" : "series"}${applied ? " included with selected subscriptions" : " to explore"}. ${catalog.content.length - content.length} watched or hidden titles omitted on this page.`}
      </p>
      <CatalogGrid {...catalog} content={content} mediaType={type} />
      {catalog.pages > 1 && !catalog.loading && (
        <CustomPagination
          page={filters.page}
          setPage={(page) => update({ page })}
          numOfPages={catalog.pages}
        />
      )}
    </div>
  );
}
