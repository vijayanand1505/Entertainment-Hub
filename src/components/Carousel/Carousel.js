import { img_300, noPicture } from "../../config/config";
import { Link, useLocation } from "react-router-dom";
import { personPath, validPersonId } from "../../utils/people";
import "./Carousel.css";

export default function Carousel({ credits = [], sourceTitle }) {
  const location = useLocation();
  return (
    <div className="cast-list" aria-label="Cast">
      {credits
        .filter((person) => validPersonId(person.id))
        .slice(0, 12)
        .map((person) => (
          <Link
            className="cast-person"
            key={person.id}
            aria-label={`View ${person.name}’s profile`}
            to={{
              pathname: personPath(person.id),
              state: {
                from: sourceTitle?.path || location.pathname + location.search,
                fromTitle: sourceTitle?.title,
              },
            }}
          >
            <img
              src={
                person.profile_path
                  ? `${img_300}${person.profile_path}`
                  : noPicture
              }
              alt=""
              loading="lazy"
              onError={(event) => {
                if (!event.currentTarget.src.endsWith(noPicture))
                  event.currentTarget.src = noPicture;
              }}
            />
            <span>{person.name}</span>
            <small>{person.character}</small>
          </Link>
        ))}
    </div>
  );
}
