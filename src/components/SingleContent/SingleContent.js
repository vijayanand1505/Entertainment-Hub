import StarRoundedIcon from "@material-ui/icons/StarRounded";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import PlayArrowRoundedIcon from "@material-ui/icons/PlayArrowRounded";
import { img_300, unavailable } from "../../config/config";
import "./SingleContent.css";
import ContentModal from "../ContentModal/ContentModal";
import SaveButton from "../SaveButton";
import CollectionButton from "../CollectionButton";
import { useTrailer } from "../../context/TrailerContext";
import { useTitleModal } from "../../context/TitleModalContext";

const SingleContent = ({
  id,
  poster,
  title,
  date,
  media_type,
  vote_average,
  onSelect,
}) => {
  const openTrailer = useTrailer();
  const openTitle = useTitleModal();
  const showDetails = (event) =>
    onSelect
      ? onSelect()
      : openTitle({ id, type: media_type }, event.currentTarget);
  const item = {
    id,
    title,
    media_type,
    poster_path: poster,
    release_date: date,
    vote_average,
  };
  const card = (
    <>
      <span className="poster-frame">
        <img
          className="poster"
          src={poster ? `${img_300}${poster}` : unavailable}
          onError={(event) => {
            if (!event.currentTarget.src.endsWith(unavailable))
              event.currentTarget.src = unavailable;
          }}
          alt={title}
          loading="lazy"
        />
        <span className="card-rating">
          <StarRoundedIcon />
          {vote_average > 0 ? Number(vote_average).toFixed(1) : "New"}
        </span>
        <span className="card-type">
          {media_type === "tv" ? "TV SERIES" : "MOVIE"}
        </span>
      </span>
      <span className="title">{title}</span>
      <span className="subTitle">
        <span>{date ? date.slice(0, 4) : "Coming soon"}</span>
        <span className="card-meta-dot">·</span>
        <span>{media_type === "tv" ? "TV Series" : "Movie"}</span>
      </span>
    </>
  );
  return (
    <article className="media-card">
      {onSelect ? (
        <button
          type="button"
          className="media"
          aria-label={`View details for ${title}`}
          onClick={onSelect}
        >
          {card}
        </button>
      ) : (
        <ContentModal
          media_type={media_type}
          id={id}
          triggerClassName="media"
          label={`View details for ${title}`}
        >
          {card}
        </ContentModal>
      )}
      <SaveButton compact item={item} />
      <div className="poster-quick-actions">
        <div
          className="poster-action-bar"
          role="group"
          aria-label={`Quick actions for ${title}`}
        >
          <button
            type="button"
            className="poster-quick-button"
            title="Watch trailer"
            aria-label={`Watch trailer for ${title}`}
            aria-haspopup="dialog"
            onClick={() => openTrailer({ title, type: media_type, id })}
          >
            <PlayArrowRoundedIcon />
          </button>
          <button
            type="button"
            className="poster-quick-button"
            title="View details"
            aria-label={`Quick details for ${title}`}
            aria-haspopup="dialog"
            onClick={showDetails}
          >
            <InfoOutlinedIcon />
          </button>
          <CollectionButton compact item={item} />
        </div>
      </div>
    </article>
  );
};
export default SingleContent;
