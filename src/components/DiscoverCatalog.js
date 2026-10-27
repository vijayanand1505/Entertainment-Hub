import { useHistory, useLocation } from "react-router-dom";
import Genres from "./Genres/Genres";
import DiscoveryFilters from "./DiscoveryFilters";
import CustomPagination from "./Pagination/CustomPagination";
import CatalogGrid from "./CatalogGrid";
import useCatalog from "../hooks/useCatalog";
import {
  readDiscovery,
  discoverySearch,
  buildDiscoverPath,
} from "../utils/discovery";

export default function DiscoverCatalog({ type }) {
  const history = useHistory();
  const location = useLocation();
  const filters = readDiscovery(location.search, type);
  const isMovie = type === "movie";
  const catalog = useCatalog(buildDiscoverPath(type, filters));
  const update = (changes) =>
    history.push({
      pathname: location.pathname,
      search: discoverySearch({ ...filters, page: 1, ...changes }),
    });
  return (
    <div>
      <div className="page-heading">
        <span className="eyebrow">
          {isMovie ? "FOR THE LOVE OF CINEMA" : "YOUR NEXT BINGE STARTS HERE"}
        </span>
        <h1>
          {isMovie
            ? "A world of great movies."
            : "Stories worth staying in for."}
        </h1>
        <p>
          {isMovie
            ? "From the biggest blockbusters to your next unexpected favorite. Find a film for every mood."
            : "Get lost in a new world. Discover the series everyone’s watching, and a few hidden gems."}
        </p>
      </div>
      <DiscoveryFilters
        type={type}
        filters={filters}
        onChange={update}
        onReset={() => history.push(location.pathname)}
      />
      <Genres
        type={type}
        selectedGenres={filters.genres.map((id) => ({ id: Number(id) }))}
        setSelectedGenres={(genres) =>
          update({ genres: genres.map((genre) => String(genre.id)) })
        }
      />
      <p className="discovery-summary" role="status">
        {catalog.loading
          ? "Finding your next favorite…"
          : catalog.error
            ? "Titles are taking an intermission."
            : `${catalog.total.toLocaleString()} ${isMovie ? "movies" : "series"} to explore`}
      </p>
      <CatalogGrid {...catalog} mediaType={type} />
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
