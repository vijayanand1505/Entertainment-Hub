import GitHubIcon from "@material-ui/icons/GitHub";
import OpenInNewRoundedIcon from "@material-ui/icons/OpenInNewRounded";
import { creator } from "../config/creator";
import "./CreatorCredit.css";

export default function CreatorCredit({ compact = false }) {
  return (
    <a
      className={`creator-credit ${compact ? "creator-credit-compact" : "creator-credit-full"}`}
      href={creator.github}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${compact ? "Created" : "Designed and developed"} by ${creator.name} — view GitHub profile (opens in a new tab)`}
    >
      {compact ? (
        <>
          <span>by</span>
          <strong>{creator.name}</strong>
          <GitHubIcon />
        </>
      ) : (
        <>
          <span className="creator-github-icon">
            <GitHubIcon />
          </span>
          <span>
            <small>DESIGNED &amp; DEVELOPED BY</small>
            <strong>
              {creator.name}
              <OpenInNewRoundedIcon />
            </strong>
          </span>
        </>
      )}
    </a>
  );
}
