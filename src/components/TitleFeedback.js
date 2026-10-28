import { useState } from "react";
import { Menu, MenuItem } from "@material-ui/core";
import MoreHorizRoundedIcon from "@material-ui/icons/MoreHorizRounded";
import CheckCircleOutlineRoundedIcon from "@material-ui/icons/CheckCircleOutlineRounded";
import FavoriteBorderRoundedIcon from "@material-ui/icons/FavoriteBorderRounded";
import NotInterestedRoundedIcon from "@material-ui/icons/NotInterestedRounded";
import { usePersonalization } from "../context/PersonalizationContext";
import { titleKey } from "../utils/library";
import "./Personalization.css";

const options = [
  ["watched", "Watched", CheckCircleOutlineRoundedIcon],
  ["liked", "Liked", FavoriteBorderRoundedIcon],
  ["hidden", "Not interested", NotInterestedRoundedIcon],
];
export default function TitleFeedback({ item, compact = false }) {
  const { feedback, toggleFeedback } = usePersonalization();
  const entry = feedback.find((value) => titleKey(value) === titleKey(item));
  const [anchor, setAnchor] = useState(null);
  if (compact)
    return (
      <>
        <button
          type="button"
          className="poster-quick-button"
          aria-label={`More actions for ${item.title || item.name}`}
          aria-haspopup="menu"
          aria-expanded={Boolean(anchor)}
          onClick={(e) => setAnchor(e.currentTarget)}
        >
          <MoreHorizRoundedIcon />
        </button>
        <Menu
          anchorEl={anchor}
          open={Boolean(anchor)}
          onClose={() => setAnchor(null)}
          style={{ zIndex: 1500 }}
          MenuListProps={{
            "aria-label": `Title preferences for ${item.title || item.name}`,
          }}
        >
          {options.map(([kind, label, Icon]) => (
            <MenuItem
              key={kind}
              role="menuitemcheckbox"
              aria-checked={Boolean(entry?.[kind])}
              onClick={() => {
                setAnchor(null);
                toggleFeedback(item, kind);
              }}
            >
              <Icon className="feedback-menu-icon" />
              {entry?.[kind]
                ? {
                    watched: "Mark as unwatched",
                    liked: "Unlike",
                    hidden: "Show in discovery",
                  }[kind]
                : label}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  return (
    <div
      className="title-feedback"
      role="group"
      aria-label={`Your preferences for ${item.title || item.name}`}
    >
      {options.map(([kind, label, Icon]) => (
        <button
          type="button"
          key={kind}
          aria-pressed={Boolean(entry?.[kind])}
          onClick={() => toggleFeedback(item, kind)}
        >
          <Icon />
          {label}
        </button>
      ))}
    </div>
  );
}
