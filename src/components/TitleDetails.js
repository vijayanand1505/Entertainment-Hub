import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import PlayArrowRoundedIcon from "@material-ui/icons/PlayArrowRounded";
import StarRoundedIcon from "@material-ui/icons/StarRounded";
import OpenInNewRoundedIcon from "@material-ui/icons/OpenInNewRounded";
import { img_500, unavailable } from "../config/config";
import { creator } from "../config/creator";
import { useLibrary } from "../context/LibraryContext";
import { titlePath } from "../utils/titleUrls";
import { playableVideos } from "../utils/videos";
import { useTrailer } from "../context/TrailerContext";
import Carousel from "./Carousel/Carousel";
import WatchProviders from "./WatchProviders";
import RelatedTitles from "./RelatedTitles";
import SaveButton from "./SaveButton";
import TitleFeedback from "./TitleFeedback";
import ShareTitle from "./ShareTitle";
import CollectionButton from "./CollectionButton";
import useTmdb from "../hooks/useTmdb";
import "./ContentModal/ContentModal.css";

export default function TitleDetails({
  type,
  id,
  asPage = false,
  headingRef,
  onTitleLoaded,
  onSelectRelated,
}) {
  const location = useLocation();
  const { recordView } = useLibrary();
  const openTrailer = useTrailer();
  const details = useTmdb(`${type}/${id}?append_to_response=videos,credits`);
  const content = details.data;
  const title = content?.title || content?.name;
  const date = content?.release_date || content?.first_air_date;
  const item = content ? { ...content, media_type: type } : null;
  const videos = playableVideos(content?.videos?.results);
  const trailer = videos[0];
  const headingId = `detail-title-${type}-${id}`;
  const Heading = asPage ? "h1" : "h2";
  useEffect(() => {
    if (content) recordView({ ...content, media_type: type });
  }, [content, type, recordView]);
  useEffect(() => {
    if (title) onTitleLoaded?.(title);
  }, [title, onTitleLoaded]);
  useEffect(() => {
    if (!asPage || !title) return;
    const previous = document.title;
    document.title = `${title}${date ? " (" + date.slice(0, 4) + ")" : ""} — Entertainment Hub | ${creator.name}`;
    return () => {
      document.title = previous;
    };
  }, [asPage, title, date]);
  return (
    <div className="details-shell">
      {details.error ? (
        <div className="catalog-state" role="alert">
          <Heading id={headingId}>
            {details.status === 404
              ? "This title isn’t available."
              : "Couldn’t load details"}
          </Heading>
          <p>
            {details.status === 404
              ? "This title may have been removed or the link may be incorrect."
              : "We couldn’t load these details. Please try again."}
          </p>
          {details.status === 404 ? (
            <Link className="button" to="/">
              Explore titles
            </Link>
          ) : (
            <button className="button" onClick={details.retry}>
              Try again
            </button>
          )}
        </div>
      ) : !content ? (
        <div className="details-loading" role="status">
          <Heading id={headingId}>Setting the scene…</Heading>
          <div className="skeleton" />
          <div className="skeleton skeleton-line" />
          <span>Loading title details</span>
        </div>
      ) : (
        <>
          {content.backdrop_path && (
            <img
              className="details-backdrop"
              src={`https://image.tmdb.org/t/p/w1280${content.backdrop_path}`}
              alt=""
            />
          )}
          <div className="detail-layout">
            <img
              className="detail-poster"
              src={
                content.poster_path
                  ? `${img_500}${content.poster_path}`
                  : unavailable
              }
              onError={(event) => {
                if (!event.currentTarget.src.endsWith(unavailable))
                  event.currentTarget.src = unavailable;
              }}
              alt={title}
            />
            <div className="detail-info">
              <span className="eyebrow">
                {type === "tv" ? "TV series" : "Movie"}
              </span>
              <Heading id={headingId} ref={headingRef} tabIndex={-1}>
                {title}
              </Heading>
              <div className="detail-meta">
                <span className="hero-rating">
                  <StarRoundedIcon />
                  {content.vote_average > 0
                    ? content.vote_average.toFixed(1)
                    : "Not rated"}
                </span>
                {date && <span>{date.slice(0, 4)}</span>}
                <span>
                  {type === "tv"
                    ? `${content.number_of_seasons || 1} season${content.number_of_seasons === 1 ? "" : "s"}`
                    : content.runtime
                      ? `${Math.floor(content.runtime / 60)}h ${content.runtime % 60}m`
                      : "Movie"}
                </span>
              </div>
              <div className="detail-genres">
                {content.genres?.map((genre) => (
                  <span key={genre.id}>{genre.name}</span>
                ))}
              </div>
              {content.tagline && (
                <p className="detail-tagline">{content.tagline}</p>
              )}
              <p className="detail-overview">
                {content.overview || "No synopsis available."}
              </p>
              <div className="detail-actions">
                {trailer && (
                  <button
                    className="button trailer-button"
                    type="button"
                    aria-haspopup="dialog"
                    onClick={() => openTrailer({ title, videos })}
                  >
                    <PlayArrowRoundedIcon />
                    Watch {trailer.type === "Trailer" ? "trailer" : "video"}
                  </button>
                )}
                <SaveButton item={item} />
                <CollectionButton item={item} />
                <ShareTitle type={type} id={id} />
              </div>
              {!trailer && (
                <p className="no-trailer">No trailer available yet</p>
              )}
              <TitleFeedback item={item} />
              {!asPage && (
                <Link
                  className="text-link detail-page-link"
                  to={{
                    pathname: titlePath(type, id),
                    state: { from: location.pathname + location.search },
                  }}
                >
                  Open title page
                  <OpenInNewRoundedIcon />
                </Link>
              )}
              {content.credits?.cast?.length > 0 && (
                <div className="detail-cast">
                  <h3>Cast</h3>
                  <Carousel
                    credits={content.credits.cast}
                    sourceTitle={{ path: titlePath(type, id), title }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="detail-extras">
            <WatchProviders id={id} type={type} />
            <RelatedTitles id={id} type={type} onSelect={onSelectRelated} />
          </div>
        </>
      )}
    </div>
  );
}
