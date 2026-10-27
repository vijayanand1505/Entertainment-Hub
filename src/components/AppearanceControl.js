import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Dialog from "@material-ui/core/Dialog";
import PaletteOutlinedIcon from "@material-ui/icons/PaletteOutlined";
import Brightness2OutlinedIcon from "@material-ui/icons/Brightness2Outlined";
import WbSunnyOutlinedIcon from "@material-ui/icons/WbSunnyOutlined";
import DesktopWindowsOutlinedIcon from "@material-ui/icons/DesktopWindowsOutlined";
import CloseRoundedIcon from "@material-ui/icons/CloseRounded";
import CheckRoundedIcon from "@material-ui/icons/CheckRounded";
import { useAppearance } from "../context/AppearanceContext";
import "./AppearanceControl.css";

export default function AppearanceControl() {
  const { preferences, resolvedTheme, persistent, update, reset } =
    useAppearance();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [location.key]);
  return (
    <>
      <button
        className="appearance-trigger"
        aria-label="Appearance settings"
        title="Appearance settings"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <PaletteOutlinedIcon />
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth={false}
        PaperProps={{ className: "appearance-dialog" }}
        aria-labelledby="appearance-heading"
        aria-describedby="appearance-description"
      >
        <div className="appearance-heading">
          <span className="appearance-heading-icon">
            <PaletteOutlinedIcon />
          </span>
          <div>
            <span className="eyebrow">MAKE YOURSELF AT HOME</span>
            <h2 id="appearance-heading">Your screen. Your style.</h2>
          </div>
          <button
            className="appearance-close"
            aria-label="Close appearance settings"
            onClick={() => setOpen(false)}
          >
            <CloseRoundedIcon />
          </button>
        </div>
        <p id="appearance-description" className="appearance-description">
          A little more comfortable, exactly how you like it. Changes apply
          instantly.
        </p>
        <div className="appearance-options">
          <fieldset>
            <legend>Theme</legend>
            <div className="appearance-theme-options">
              {[
                {
                  value: "dark",
                  title: "Dark",
                  description: "A cinematic feel",
                  Icon: Brightness2OutlinedIcon,
                },
                {
                  value: "light",
                  title: "Light",
                  description: "A brighter view",
                  Icon: WbSunnyOutlinedIcon,
                },
                {
                  value: "system",
                  title: "Device",
                  description: "Follow your device",
                  Icon: DesktopWindowsOutlinedIcon,
                },
              ].map(({ value, title, description, Icon }) => (
                <label
                  className={`appearance-choice theme-choice ${preferences.theme === value ? "selected" : ""}`}
                  key={value}
                >
                  <input
                    type="radio"
                    name="appearance-theme"
                    aria-label={
                      value === "system" ? "Use device theme" : title + " theme"
                    }
                    value={value}
                    checked={preferences.theme === value}
                    onChange={() => update({ theme: value })}
                  />
                  <span
                    className={`theme-preview preview-${value}`}
                    aria-hidden="true"
                  >
                    <Icon />
                    <span className="theme-preview-lines">
                      <i />
                      <i />
                      <i />
                    </span>
                  </span>
                  <span className="choice-title">
                    {title}
                    {preferences.theme === value && (
                      <CheckRoundedIcon aria-hidden="true" />
                    )}
                  </span>
                  <small>{description}</small>
                </label>
              ))}
            </div>
            {preferences.theme === "system" && (
              <p className="appearance-hint" role="status">
                Using your device’s {resolvedTheme} appearance.
              </p>
            )}
          </fieldset>
          <fieldset>
            <legend>Text size</legend>
            <div className="appearance-text-options">
              {[
                { value: "standard", label: "Standard", size: "14px" },
                { value: "large", label: "Large", size: "18px" },
                { value: "xlarge", label: "Extra large", size: "22px" },
              ].map(({ value, label, size }) => (
                <label
                  key={value}
                  className={`appearance-choice text-choice ${preferences.textSize === value ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="appearance-text-size"
                    aria-label={label + " text"}
                    checked={preferences.textSize === value}
                    onChange={() => update({ textSize: value })}
                  />
                  <span
                    className="text-preview"
                    style={{ fontSize: size }}
                    aria-hidden="true"
                  >
                    Aa
                  </span>
                  <span className="choice-title">{label}</span>
                </label>
              ))}
            </div>
            <p className="appearance-hint">
              Scales reading text and controls throughout the app.
            </p>
          </fieldset>
          <fieldset>
            <legend>Poster layout</legend>
            <div className="appearance-density-options">
              {[
                {
                  value: "comfortable",
                  title: "Comfortable",
                  description: "Bigger posters, more breathing room",
                  count: 4,
                },
                {
                  value: "compact",
                  title: "Compact",
                  description: "More stories in every row",
                  count: 6,
                },
              ].map(({ value, title, description, count }) => (
                <label
                  key={value}
                  className={`appearance-choice density-choice ${preferences.density === value ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="appearance-density"
                    aria-label={title + " posters"}
                    checked={preferences.density === value}
                    onChange={() => update({ density: value })}
                  />
                  <span
                    className={`density-preview density-preview-${value}`}
                    aria-hidden="true"
                  >
                    {Array.from({ length: count }, (_, index) => (
                      <i key={index} />
                    ))}
                  </span>
                  <span className="choice-title">
                    {title}
                    {preferences.density === value && (
                      <CheckRoundedIcon aria-hidden="true" />
                    )}
                  </span>
                  <small>{description}</small>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="appearance-footer">
          <p role="status">
            {persistent
              ? "Your choices are saved in this browser."
              : "Browser storage is unavailable. Choices last for this visit."}
          </p>
          <div>
            <button className="text-button" onClick={reset}>
              Reset appearance
            </button>
            <button className="button" onClick={() => setOpen(false)}>
              Done
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
