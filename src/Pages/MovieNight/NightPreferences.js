import { LANGUAGES } from "../../utils/discovery";
import { MOVIE_GENRES } from "../../utils/movieNight";
export default function NightPreferences({
  value,
  onChange,
  disabled = false,
}) {
  const toggle = (field, item) => {
    const list = value[field];
    if (field === "genres" && !list.includes(item) && list.length >= 6) return;
    onChange({
      ...value,
      [field]: list.includes(item)
        ? list.filter((entry) => entry !== item)
        : [...list, item],
    });
  };
  return (
    <div className="night-preferences">
      <fieldset disabled={disabled}>
        <legend>
          Genres you enjoy <span>Choose up to 6, or leave open</span>
        </legend>
        <div className="night-chips">
          {MOVIE_GENRES.map(([id, name]) => (
            <label
              key={id}
              className={value.genres.includes(id) ? "selected" : ""}
            >
              <input
                type="checkbox"
                checked={value.genres.includes(id)}
                disabled={
                  !value.genres.includes(id) && value.genres.length >= 6
                }
                onChange={() => toggle("genres", id)}
              />
              {name}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset disabled={disabled}>
        <legend>
          Languages you’re happy to watch{" "}
          <span>None selected means any language</span>
        </legend>
        <div className="night-chips night-language-chips">
          {LANGUAGES.map(([code, name]) => (
            <label
              key={code}
              className={value.languages.includes(code) ? "selected" : ""}
            >
              <input
                type="checkbox"
                checked={value.languages.includes(code)}
                onChange={() => toggle("languages", code)}
              />
              {name}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="night-field">
        How much time do you have?
        <select
          aria-label="Available movie night time"
          value={value.minutes || ""}
          disabled={disabled}
          onChange={(event) =>
            onChange({ ...value, minutes: event.target.value })
          }
        >
          <option value="">Make a night of it · Any length</option>
          {[
            [90, "Up to 90 minutes"],
            [120, "Up to 2 hours"],
            [150, "Up to 2½ hours"],
            [180, "Up to 3 hours"],
            [240, "Up to 4 hours"],
          ].map(([minutes, label]) => (
            <option value={minutes} key={minutes}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <p className="night-help">
        We use the shortest time limit and languages everyone accepts. Genres
        help us choose a lineup; your votes decide the winner.
      </p>
    </div>
  );
}
