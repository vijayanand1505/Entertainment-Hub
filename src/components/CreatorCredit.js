import GitHubIcon from "@material-ui/icons/GitHub";
import OpenInNewRoundedIcon from "@material-ui/icons/OpenInNewRounded";
import { creator } from "../config/creator";
import "./CreatorCredit.css";

export default function CreatorCredit() {
  return (
    <div className="creator-credit">
      <GitHubIcon aria-hidden="true" />
      <span>
        Designed and developed by{" "}
        <a
          href={creator.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${creator.name} — view GitHub profile (opens in a new tab)`}
        >
          <strong>{creator.name}</strong>
        </a>
      </span>
      <OpenInNewRoundedIcon aria-hidden="true" />
    </div>
  );
}
