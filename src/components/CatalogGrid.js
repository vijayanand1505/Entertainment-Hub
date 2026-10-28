import MovieFilterOutlinedIcon from "@material-ui/icons/MovieFilterOutlined";
import SingleContent from "./SingleContent/SingleContent";

export default function CatalogGrid({
  content,
  loading,
  error,
  retry,
  mediaType,
  limit,
}) {
  if (error)
    return (
      <div className="catalog-state" role="alert">
        <MovieFilterOutlinedIcon />
        <h2>Couldn’t load titles</h2>
        <p>We couldn’t load the titles. Check your connection and try again.</p>
        <button className="button" onClick={retry}>
          Try again
        </button>
      </div>
    );
  if (!loading && !content.length)
    return (
      <div className="catalog-state">
        <MovieFilterOutlinedIcon />
        <h2>No titles found</h2>
        <p>Try a different search or a different combination of genres.</p>
      </div>
    );
  return (
    <div
      className="trending"
      aria-busy={loading}
      aria-label={loading ? "Loading titles" : "Titles"}
    >
      {loading
        ? Array.from({ length: limit || 12 }, (_, i) => (
            <div key={i} aria-hidden="true">
              <div className="skeleton skeleton-poster" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line short" />
            </div>
          ))
        : content.slice(0, limit).map((item) => (
            <SingleContent
              key={`${item.media_type || mediaType}-${item.id}`}
              id={item.id}
              poster={item.poster_path}
              title={item.title || item.name}
              date={item.release_date || item.first_air_date}
              media_type={item.media_type || mediaType}
              vote_average={item.vote_average}
            />
          ))}
    </div>
  );
}
