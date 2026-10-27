import { Link, useHistory, useLocation, useParams } from "react-router-dom";
import ArrowBackRoundedIcon from "@material-ui/icons/ArrowBackRounded";
import TitleDetails from "../../components/TitleDetails";
import { titlePath, validTitle } from "../../utils/titleUrls";
import "./Title.css";

export function TitleNotFound() {
  return (
    <div className="catalog-state">
      <span className="eyebrow">A STORY STILL TO BE DISCOVERED</span>
      <h1>This title link doesn’t look right.</h1>
      <p>Find something new in our collection of movies and TV series.</p>
      <Link className="button" to="/">
        Back to Discover
      </Link>
    </div>
  );
}
export default function TitlePage() {
  const { mediaType, id } = useParams();
  const history = useHistory();
  const location = useLocation();
  const candidate = location.state?.from;
  const from =
    typeof candidate === "string" &&
    candidate.startsWith("/") &&
    !candidate.startsWith("//")
      ? candidate
      : "/";
  if (!validTitle(mediaType, id)) return <TitleNotFound />;
  return (
    <div className="title-page">
      <nav className="title-breadcrumb" aria-label="Title navigation">
        <Link to={from}>
          <ArrowBackRoundedIcon />
          {from.startsWith("/title/") ? "Previous title" : "Back to browsing"}
        </Link>
        <span>{mediaType === "tv" ? "TV Series" : "Movie"} details</span>
      </nav>
      <TitleDetails
        type={mediaType}
        id={Number(id)}
        asPage
        onSelectRelated={(next) =>
          history.push({
            pathname: titlePath(next.type, next.id),
            state: { from: location.pathname },
          })
        }
      />
    </div>
  );
}
