import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import GroupRoundedIcon from "@material-ui/icons/GroupRounded";
import ShuffleRoundedIcon from "@material-ui/icons/ShuffleRounded";
import PlayArrowRoundedIcon from "@material-ui/icons/PlayArrowRounded";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import StarRoundedIcon from "@material-ui/icons/StarRounded";
import useTmdb from "../../hooks/useTmdb";
import usePick from "../../hooks/usePick";
import { MOODS } from "../../utils/picks";
import { INITIAL_PICK_FILTERS } from "../../utils/pickSession";
import { LANGUAGES } from "../../utils/discovery";
import { img_500, unavailable } from "../../config/config";
import { useTitleModal } from "../../context/TitleModalContext";
import { useTrailer } from "../../context/TrailerContext";
import SaveButton from "../../components/SaveButton";
import CollectionButton from "../../components/CollectionButton";
import StreamingServices from "../../components/StreamingServices";
import TitleFeedback from "../../components/TitleFeedback";
import { usePersonalization } from "../../context/PersonalizationContext";
import "./Pick.css";

export default function Pick() {
  const { feedback, streaming } = usePersonalization();
  const result = usePick({ feedback, streaming });
  const filters = result.preferences;
  const genreRequest = useTmdb(`genre/${filters.type}/list`);
  const genres = genreRequest.data?.genres || [];
  const openTitle = useTitleModal();
  const openTrailer = useTrailer();
  const item = result.item;
  const resultHeading = useRef(null);
  useEffect(() => {
    if (!item) return;
    resultHeading.current?.focus({ preventScroll: true });
    if (window.innerWidth <= 800)
      resultHeading.current?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
  }, [item]);
  const resultTitle = item?.title || item?.name;
  const matchFilters = result.filters || filters;
  const update = result.updatePreferences;
  const run = () => result.pick(filters, genres);
  return (
    <div className="pick-page">
      <div className="page-heading">
        <span className="eyebrow">Recommendations</span>
        <h1>Pick something for me</h1>
        <p>Choose what you’re in the mood for and how much time you have.</p>
        <Link className="night-pick-link" to="/movie-night">
          <GroupRoundedIcon />
          Choosing with friends? Plan a movie night →
        </Link>
      </div>
      <div className="pick-layout">
        <form
          className="pick-preferences"
          onSubmit={(event) => {
            event.preventDefault();
            run();
          }}
        >
          <div className="pick-section-label">
            <span>01</span>
            <h2>What are you in the mood for?</h2>
          </div>
          <div
            className="period-tabs pick-type"
            role="group"
            aria-label="Pick a movie or series"
          >
            {[
              ["movie", "Movies"],
              ["tv", "TV series"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                aria-pressed={filters.type === value}
                className={filters.type === value ? "active" : ""}
                onClick={() => update({ type: value, genre: "", minutes: "" })}
              >
                {label}
              </button>
            ))}
          </div>
          <fieldset className="pick-moods">
            <legend className="sr-only">Choose your mood</legend>
            {MOODS.map((mood) => (
              <label
                key={mood.value}
                className={
                  filters.mood === mood.value && !filters.genre
                    ? "selected"
                    : ""
                }
              >
                <input
                  type="radio"
                  name="pick-mood"
                  checked={filters.mood === mood.value && !filters.genre}
                  onChange={() => update({ mood: mood.value, genre: "" })}
                />
                <span aria-hidden="true">{mood.symbol}</span>
                <strong>{mood.label}</strong>
              </label>
            ))}
          </fieldset>
          <div className="pick-section-label">
            <span>02</span>
            <h2>Genre, language, and time</h2>
          </div>
          <div className="pick-fields">
            <label>
              Prefer a specific genre?
              <select
                aria-label="Preferred genre"
                value={filters.genre}
                disabled={genreRequest.loading || genreRequest.error}
                onChange={(e) => update({ genre: e.target.value, mood: "any" })}
              >
                <option value="">
                  {genreRequest.loading
                    ? "Loading genres…"
                    : "Let my mood decide"}
                </option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Original language
              <select
                aria-label="Pick language"
                value={filters.language}
                onChange={(e) => update({ language: e.target.value })}
              >
                <option value="">Any language</option>
                {LANGUAGES.map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {filters.type === "tv" ? "Time per episode" : "Time for a movie"}
              <select
                aria-label="Available time"
                value={filters.minutes}
                onChange={(e) => update({ minutes: e.target.value })}
              >
                <option value="">No time limit</option>
                {(filters.type === "tv"
                  ? [
                      [30, "Up to 30 minutes"],
                      [45, "Up to 45 minutes"],
                      [60, "Up to an hour"],
                    ]
                  : [
                      [90, "Up to 90 minutes"],
                      [120, "Up to 2 hours"],
                      [180, "Up to 3 hours"],
                    ]
                ).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <StreamingServices />
          <p className="pick-note">
            Watched and hidden titles are skipped. Choose a mood or a specific
            genre. Series time refers to an episode.
          </p>
          {genreRequest.error && (
            <p className="collection-error" role="alert">
              Genres couldn’t load.{" "}
              <button
                type="button"
                className="text-button"
                onClick={genreRequest.retry}
              >
                Retry genres
              </button>
            </p>
          )}
          <button
            className="button pick-submit"
            type="submit"
            disabled={
              result.loading || genreRequest.loading || genreRequest.error
            }
          >
            <ShuffleRoundedIcon />
            {result.loading ? "Finding a match…" : "Pick for me"}
          </button>
        </form>
        <section
          className="pick-result"
          aria-label="Your recommendation"
          aria-busy={result.loading}
        >
          {result.loading ? (
            <div className="pick-waiting" role="status">
              <ShuffleRoundedIcon className="pick-loading-icon" />
              <h2>Finding a match…</h2>
              <p>Checking titles against your preferences.</p>
              <div className="skeleton skeleton-line" />
            </div>
          ) : result.error && !item ? (
            <div className="pick-waiting" role="alert">
              <ShuffleRoundedIcon />
              <h2>Couldn’t load a recommendation</h2>
              <p>
                We couldn’t find a pick right now. Check your connection and try
                again.
              </p>
              <button className="button" onClick={run}>
                Try again
              </button>
            </div>
          ) : result.empty && !item ? (
            <div className="pick-waiting" role="status">
              <ShuffleRoundedIcon />
              <h2>No new matches</h2>
              <p>
                No new matches in this selection. Try another mood, allow more
                time, or reset to start fresh.
              </p>
              <button
                className="button"
                onClick={() => {
                  update(INITIAL_PICK_FILTERS);
                  result.reset();
                }}
              >
                Reset preferences
              </button>
            </div>
          ) : item ? (
            <div
              className="pick-recommendation"
              key={`${item.media_type}-${item.id}`}
            >
              <div className="pick-result-art">
                {item.backdrop_path && (
                  <img
                    className="pick-backdrop"
                    src={`https://image.tmdb.org/t/p/w780${item.backdrop_path}`}
                    alt=""
                  />
                )}
                <img
                  className="pick-poster"
                  src={
                    item.poster_path ? img_500 + item.poster_path : unavailable
                  }
                  alt={resultTitle}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = unavailable;
                  }}
                />
              </div>
              <div className="pick-result-copy">
                {result.error && (
                  <p className="collection-error" role="alert">
                    We couldn’t find another pick. Your current pick is still
                    here. Please try again.
                  </p>
                )}
                {result.empty && (
                  <p className="pick-note" role="status">
                    No new matches in this selection. Your current pick is still
                    here. Try changing your preferences.
                  </p>
                )}
                <span className="eyebrow">Your recommendation</span>
                <h2 ref={resultHeading} tabIndex={-1}>
                  {resultTitle}
                </h2>
                <div className="pick-meta">
                  <span>
                    <StarRoundedIcon />
                    {item.vote_average > 0
                      ? item.vote_average.toFixed(1)
                      : "Not rated"}
                  </span>
                  <span>
                    {(item.release_date || item.first_air_date || "").slice(
                      0,
                      4,
                    )}
                  </span>
                  <span>
                    {item.media_type === "tv" ? "TV Series" : "Movie"}
                  </span>
                  {item.pick_runtime > 0 && (
                    <span>
                      {item.pick_runtime} min
                      {item.media_type === "tv" ? " / episode" : ""}
                    </span>
                  )}
                </div>
                <p className="pick-match">
                  {matchFilters.genre
                    ? result.genreName
                    : MOODS.find((mood) => mood.value === matchFilters.mood)
                        ?.label}
                  {matchFilters.language
                    ? ` · ${LANGUAGES.find(([code]) => code === matchFilters.language)?.[1]}`
                    : ""}
                  {matchFilters.minutes
                    ? ` · Up to ${matchFilters.minutes} min${matchFilters.type === "tv" ? " / episode" : ""}`
                    : ""}
                </p>
                <p className="pick-overview">
                  {item.overview ||
                    "No synopsis available. Open the details to learn more."}
                </p>
                <div className="pick-result-actions">
                  <button
                    className="button"
                    onClick={(e) =>
                      openTitle(
                        { id: item.id, type: item.media_type },
                        e.currentTarget,
                      )
                    }
                  >
                    <InfoOutlinedIcon />
                    View details
                  </button>
                  <button
                    className="button button-secondary"
                    onClick={() =>
                      openTrailer({
                        title: resultTitle,
                        id: item.id,
                        type: item.media_type,
                      })
                    }
                  >
                    <PlayArrowRoundedIcon />
                    Trailer
                  </button>
                  <SaveButton item={item} />
                  <CollectionButton item={item} />
                </div>
                <TitleFeedback item={item} />
                <button className="pick-again" onClick={run}>
                  <ShuffleRoundedIcon />
                  Try another
                </button>
                <button
                  className="text-button pick-clear"
                  onClick={result.reset}
                >
                  Clear pick
                </button>
              </div>
            </div>
          ) : (
            <div className="pick-waiting">
              <div className="pick-orbit" aria-hidden="true">
                <span>✦</span>
              </div>
              <span className="eyebrow">Getting started</span>
              <h2>Ready for a suggestion?</h2>
              <p>
                Choose your preferences, then select Pick for me to get a movie
                or series recommendation.
              </p>
              <div className="pick-empty-tags">
                <span>Choose a mood</span>
                <span>Set a time limit</span>
                <span>Get a suggestion</span>
              </div>
            </div>
          )}
          <span className="sr-only" role="status">
            {item ? `Your pick: ${resultTitle}` : ""}
          </span>
        </section>
      </div>
    </div>
  );
}
