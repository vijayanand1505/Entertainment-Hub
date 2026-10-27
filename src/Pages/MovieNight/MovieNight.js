import { useEffect, useRef, useState } from "react";
import { Link, useHistory, useLocation, useParams } from "react-router-dom";
import { Dialog } from "@material-ui/core";
import GroupRoundedIcon from "@material-ui/icons/GroupRounded";
import ArrowForwardRoundedIcon from "@material-ui/icons/ArrowForwardRounded";
import CheckRoundedIcon from "@material-ui/icons/CheckRounded";
import CloseRoundedIcon from "@material-ui/icons/CloseRounded";
import FileCopyOutlinedIcon from "@material-ui/icons/FileCopyOutlined";
import PlayArrowRoundedIcon from "@material-ui/icons/PlayArrowRounded";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import StarRoundedIcon from "@material-ui/icons/StarRounded";
import FavoriteRoundedIcon from "@material-ui/icons/FavoriteRounded";
import { useCollections } from "../../context/CollectionsContext";
import { useTitleModal } from "../../context/TitleModalContext";
import { useTrailer } from "../../context/TrailerContext";
import { img_500, unavailable } from "../../config/config";
import {
  EMPTY_PREFERENCES,
  copyNightLink,
  nightRequest,
  recentRooms,
  rememberRoom,
} from "../../utils/movieNight";
import { LANGUAGES } from "../../utils/discovery";
import useMovieNight from "../../hooks/useMovieNight";
import SaveButton from "../../components/SaveButton";
import CollectionButton from "../../components/CollectionButton";
import NightPreferences from "./NightPreferences";
import NightMembers, { NightAvatars } from "./NightMembers";
import "./MovieNight.css";

function NightIntro({ invitation }) {
  return (
    <div className="night-intro">
      <span className="night-intro-icon">
        <GroupRoundedIcon />
      </span>
      <span className="eyebrow">GOOD STORIES. GREAT COMPANY.</span>
      <h1>
        {invitation ? (
          <>
            You’re invited to
            <br />
            <span>{invitation.name}.</span>
          </>
        ) : (
          <>
            One movie.
            <br />
            Everyone’s kind
            <br />
            {" of night"}
            <span>.</span>
          </>
        )}
      </h1>
      <p>
        {invitation
          ? `${invitation.memberCount} ${invitation.memberCount === 1 ? "person is" : "people are"} already here. Bring your taste. Find a story together.`
          : "Skip the endless “what should we watch?” Share a room, vote in private, and find your common ground."}
      </p>
      <div className="night-vote-preview" aria-hidden="true">
        <span className="preview-pass">
          ×<small>Pass</small>
        </span>
        <span className="preview-maybe">
          ?<small>Maybe</small>
        </span>
        <span className="preview-watch">
          ♡<small>Watch it</small>
        </span>
      </div>
      <ol className="night-how">
        <li>
          <span>01</span>
          <div>
            <strong>Bring your people</strong>
            <p>Invite up to 11 friends. No account needed.</p>
          </div>
        </li>
        <li>
          <span>02</span>
          <div>
            <strong>Go with your gut</strong>
            <p>Watch it, Maybe, or Pass. Your choices stay private.</p>
          </div>
        </li>
        <li>
          <span>03</span>
          <div>
            <strong>Meet your movie-night match</strong>
            <p>Everyone finishes. Your strongest matches appear.</p>
          </div>
        </li>
      </ol>
    </div>
  );
}
function NightSetup({ invitation, onJoin, busy, error, onCreate }) {
  const { collections } = useCollections();
  const history = useHistory();
  const location = useLocation();
  const [name, setName] = useState("Our movie night");
  const [displayName, setDisplayName] = useState("");
  const [prefs, setPrefs] = useState(EMPTY_PREFERENCES);
  const [source, setSource] = useState(
    () => new URLSearchParams(location.search).get("collection") || "",
  );
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [previous] = useState(recentRooms);
  const validCollections = collections.filter((entry) =>
    entry.items.some((item) => item.media_type === "movie"),
  );
  const selected = validCollections.find((entry) => entry.id === source);
  return (
    <div className="night-setup-layout">
      <NightIntro invitation={invitation} />
      <div>
        <form
          className="night-setup-panel"
          onSubmit={(event) => {
            event.preventDefault();
            const values = {
              name,
              displayName,
              preferences: prefs,
              ...(selected
                ? {
                    source: {
                      name: selected.name,
                      ids: selected.items
                        .filter((item) => item.media_type === "movie")
                        .slice(0, 30)
                        .map((item) => item.id),
                    },
                  }
                : {}),
            };
            if (invitation) onJoin(values);
            else onCreate(values);
          }}
        >
          <div className="night-panel-heading">
            <h2>{invitation ? "Take your seat." : "Set the scene."}</h2>
            <span className="night-small-pill">
              {invitation ? "Join the crew" : "2–12 people"}
            </span>
          </div>
          <label className="night-field">
            Your name
            <input
              autoComplete="nickname"
              required
              maxLength={30}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="What should we call you?"
              disabled={busy}
            />
          </label>
          {!invitation && (
            <>
              <label className="night-field">
                Movie-night name
                <input
                  required
                  maxLength={60}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Friday night, sorted"
                  disabled={busy}
                />
              </label>
              <label className="night-field">
                Build your lineup from
                <select
                  value={selected?.id || ""}
                  onChange={(event) => setSource(event.target.value)}
                  disabled={busy}
                >
                  <option value="">Discover movies for the group</option>
                  {validCollections.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name} ·{" "}
                      {
                        entry.items.filter(
                          (item) => item.media_type === "movie",
                        ).length
                      }{" "}
                      movies
                    </option>
                  ))}
                </select>
              </label>
              {selected && (
                <p className="night-help">
                  We’ll use up to 30 movies from this collection, then choose up
                  to 12 that fit your group. Series stay in your collection.
                </p>
              )}
            </>
          )}
          <NightPreferences value={prefs} onChange={setPrefs} disabled={busy} />
          {error && (
            <p className="night-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="button night-primary"
            type="submit"
            disabled={busy}
          >
            <GroupRoundedIcon />
            {busy
              ? "Saving your seat…"
              : invitation
                ? "Join movie night"
                : "Create movie night"}
            <ArrowForwardRoundedIcon />
          </button>
          <p className="night-help night-centered">
            Rooms stay open for 24 hours. Keep the invite link handy.
          </p>
        </form>
        {!invitation && (
          <>
            <form
              className="night-join-code"
              onSubmit={(event) => {
                event.preventDefault();
                let value = joinCode.trim().toLowerCase();
                try {
                  if (value.includes("/"))
                    value = new URL(value).pathname
                      .split("/")
                      .filter(Boolean)
                      .pop();
                } catch {}
                if (!/^[a-f0-9]{10}$/.test(value)) {
                  setJoinError(
                    "Enter the 10-character room code or a full invite link.",
                  );
                  return;
                }
                history.push("/movie-night/" + value);
              }}
            >
              <label htmlFor="night-room-code">Already have an invite?</label>
              <div>
                <input
                  id="night-room-code"
                  value={joinCode}
                  onChange={(event) => {
                    setJoinCode(event.target.value);
                    setJoinError("");
                  }}
                  placeholder="Paste a room code or invite link"
                />
                <button className="button button-secondary" type="submit">
                  Join
                </button>
              </div>
              {joinError && (
                <p className="night-error" role="alert">
                  {joinError}
                </p>
              )}
            </form>
            {previous.length > 0 && (
              <div className="night-recent">
                <strong>Your recent movie nights</strong>
                {previous.map((entry) => (
                  <Link key={entry.code} to={"/movie-night/" + entry.code}>
                    {entry.name}
                    <ArrowForwardRoundedIcon />
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
function NightInvite({ room }) {
  const [origin, setOrigin] = useState(window.location.origin);
  const [copied, setCopied] = useState("");
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(
    window.location.hostname,
  );
  useEffect(() => {
    let active = true;
    if (local)
      nightRequest("/config")
        .then((config) => {
          if (active && config.shareOrigin) setOrigin(config.shareOrigin);
        })
        .catch(() => {});
    return () => {
      active = false;
    };
  }, [local]);
  const link = origin + "/movie-night/" + room.code;
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(""), 3500);
    return () => clearTimeout(timer);
  }, [copied]);
  return (
    <section className="night-invite">
      <div>
        <span className="eyebrow">SAVE A SEAT FOR YOUR PEOPLE</span>
        <h2>Good company makes the movie.</h2>
        <p>Share this link before the host starts voting.</p>
      </div>
      <div className="night-invite-copy">
        <label htmlFor="night-invite-link">Invite link</label>
        <div>
          <input
            id="night-invite-link"
            readOnly
            value={link}
            onFocus={(event) => event.target.select()}
          />
          <button
            className="button"
            onClick={async () => {
              const okay = await copyNightLink(link);
              setCopied(
                okay
                  ? "Invite link copied!"
                  : "Select the link to copy it manually.",
              );
            }}
          >
            <FileCopyOutlinedIcon />
            <span>Copy invite</span>
          </button>
        </div>
        <p className="night-help" role="status">
          {copied ||
            `Room code: ${room.code}${local ? " · Friends on the same Wi-Fi can join while this app is running." : ""}`}
        </p>
        {local && origin === window.location.origin && (
          <p className="night-help">
            A network address couldn’t be found. Open this app using your
            computer’s Wi-Fi address before sharing the link.
          </p>
        )}
      </div>
    </section>
  );
}
function NightMovieActions({ item, extended = false }) {
  const openTitle = useTitleModal();
  const openTrailer = useTrailer();
  return (
    <div className="night-movie-actions">
      <button
        className="button button-secondary"
        onClick={(event) =>
          openTitle({ id: item.id, type: "movie" }, event.currentTarget)
        }
      >
        <InfoOutlinedIcon />
        {extended ? "Details & where to watch" : "Details"}
      </button>
      <button
        className="button button-secondary"
        onClick={() =>
          openTrailer({ title: item.title, id: item.id, type: "movie" })
        }
      >
        <PlayArrowRoundedIcon />
        Trailer
      </button>
      {extended && (
        <>
          <SaveButton item={item} />
          <CollectionButton item={item} />
        </>
      )}
    </div>
  );
}
function MoviePoster({ item, className = "" }) {
  return (
    <img
      className={className}
      src={item.poster_path ? img_500 + item.poster_path : unavailable}
      alt={item.title}
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = unavailable;
      }}
    />
  );
}
function MovieMeta({ item }) {
  return (
    <div className="night-movie-meta">
      <span>
        <StarRoundedIcon />
        {item.vote_average > 0 ? Number(item.vote_average).toFixed(1) : "New"}
      </span>
      <span>{item.release_date.slice(0, 4)}</span>
      {item.runtime > 0 && <span>{item.runtime} min</span>}
      <span>
        {LANGUAGES.find(([code]) => code === item.original_language)?.[1] ||
          item.original_language}
      </span>
    </div>
  );
}
function NightVoting({ room, busy, onVote }) {
  const [selectedId, setSelectedId] = useState(null);
  const alive = useRef(true);
  useEffect(
    () => () => {
      alive.current = false;
    },
    [],
  );
  const missing = room.deck.find((item) => !room.self.votes[item.id]);
  const selected = room.deck.find((item) => item.id === selectedId) || missing;
  const index = selected
    ? room.deck.findIndex((item) => item.id === selected.id)
    : -1;
  const heading = useRef(null);
  const card = useRef(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    if (window.innerWidth <= 850 && !document.querySelector('[role="dialog"]'))
      card.current?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")
          .matches
          ? "auto"
          : "smooth",
      });
  }, [selected?.id]);
  if (!selected)
    return (
      <div className="night-voting-done">
        <span className="night-done-icon">
          <CheckRoundedIcon />
        </span>
        <span className="eyebrow">YOUR PART IS IN THE CAN</span>
        <h2>You’ve had your say.</h2>
        <p>
          Waiting for the rest of the crew. Matches reveal automatically when
          everyone finishes.
        </p>
        <NightAvatars members={room.members} />
        <button
          className="button button-secondary"
          onClick={() => setSelectedId(room.deck[0].id)}
        >
          Review my votes
        </button>
      </div>
    );
  const choice = room.self.votes[selected.id];
  return (
    <section className="night-ballot" aria-label="Your private voting card">
      <div className="night-ballot-top">
        <span className="eyebrow">YOUR TASTE. YOUR CALL.</span>
        <span>
          Movie {index + 1} of {room.deck.length}
        </span>
      </div>
      <div
        className="night-progress"
        role="progressbar"
        aria-label="Your voting progress"
        aria-valuemin={0}
        aria-valuemax={room.deck.length}
        aria-valuenow={Object.keys(room.self.votes).length}
      >
        <span
          style={{
            width: `${(Object.keys(room.self.votes).length / room.deck.length) * 100}%`,
          }}
        />
      </div>
      <div className="night-ballot-movie" key={selected.id} ref={card}>
        <div className="night-ballot-art">
          {selected.backdrop_path && (
            <img
              className="night-ballot-backdrop"
              src={"https://image.tmdb.org/t/p/w780" + selected.backdrop_path}
              alt=""
            />
          )}
          <MoviePoster item={selected} />
        </div>
        <div className="night-ballot-copy">
          <h2 ref={heading} tabIndex={-1}>
            {selected.title}
          </h2>
          <MovieMeta item={selected} />
          <div className="night-genre-tags">
            {selected.genres.map((genre) => (
              <span key={genre.id}>{genre.name}</span>
            ))}
          </div>
          <p>
            {selected.overview ||
              "A new story is waiting. Explore the details for a closer look."}
          </p>
          <NightMovieActions item={selected} />
        </div>
      </div>
      <div
        className="night-vote-buttons"
        role="group"
        aria-label={`Vote on ${selected.title}`}
      >
        {[
          ["pass", "Pass", <CloseRoundedIcon />],
          ["maybe", "Maybe", <span aria-hidden="true">?</span>],
          ["watch", "Watch it", <FavoriteRoundedIcon />],
        ].map(([value, label, icon]) => (
          <button
            key={value}
            className={
              "night-vote night-vote-" +
              value +
              (choice === value ? " selected" : "")
            }
            aria-pressed={choice === value}
            disabled={busy}
            onClick={async () => {
              const next = await onVote(selected.id, value);
              if (next && alive.current) setSelectedId(null);
            }}
          >
            {icon}
            <strong>{label}</strong>
          </button>
        ))}
      </div>
      <div className="night-ballot-footer">
        <button
          className="text-button"
          disabled={index <= 0 || busy}
          onClick={() => setSelectedId(room.deck[index - 1].id)}
        >
          ← Previous movie
        </button>
        <span>
          {choice
            ? `Your vote: ${choice === "watch" ? "Watch it" : choice === "maybe" ? "Maybe" : "Pass"}`
            : "Your choice stays private."}
        </span>
        {!missing && (
          <button className="text-button" onClick={() => setSelectedId(null)}>
            Done reviewing
          </button>
        )}
      </div>
    </section>
  );
}
function NightResults({ room }) {
  const [showAll, setShowAll] = useState(false);
  const winner = room.results[0];
  const heading = useRef(null);
  useEffect(() => {
    if (!document.querySelector('[role="dialog"]')) {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({
        block: "center",
        behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")
          .matches
          ? "auto"
          : "smooth",
      });
    }
  }, []);
  return (
    <section className="night-results" aria-labelledby="night-match-heading">
      <div className="night-reveal-heading">
        <span className="night-result-spark" aria-hidden="true">
          ✦
        </span>
        <NightAvatars members={room.members} />
        <span className="eyebrow">THE VOTES ARE IN</span>
        <h2 id="night-match-heading" ref={heading} tabIndex={-1}>
          {winner.unanimous
            ? "Looks like movie night is sorted."
            : winner.mutual
              ? "You’ve found common ground."
              : "Your closest matches are here."}
        </h2>
        <p>
          {winner.unanimous
            ? "A story everyone wants to watch. Get comfortable."
            : winner.mutual
              ? "Nobody passed on your top pick. Let’s make a night of it."
              : "There’s no shared yes yet. These have the fewest passes, then the strongest support."}
        </p>
      </div>
      <article className="night-winner">
        <div className="night-winner-art">
          <MoviePoster item={winner} />
          <span className="night-match-badge">
            {winner.unanimous
              ? "Everyone’s in"
              : winner.mutual
                ? "A shared possibility"
                : "Closest match"}
          </span>
        </div>
        <div>
          <span className="eyebrow">YOUR #1 MOVIE-NIGHT MATCH</span>
          <h3>{winner.title}</h3>
          <MovieMeta item={winner} />
          <div className="night-match-reasons">
            <span>
              <CheckRoundedIcon />
              {winner.counts.watch} Watch it · {winner.counts.maybe} Maybe ·{" "}
              {winner.counts.pass} Pass
            </span>
            {room.constraints.minutes && (
              <span>
                <CheckRoundedIcon />
                Fits everyone’s {room.constraints.minutes}-minute limit
              </span>
            )}
            {winner.genreMatches > 0 && (
              <span>
                <CheckRoundedIcon />
                Fits {winner.genreMatches} of{" "}
                {
                  room.members.filter(
                    (member) => member.preferences.genres.length > 0,
                  ).length
                }{" "}
                chosen genre preferences
              </span>
            )}
          </div>
          <p className="night-result-overview">{winner.overview}</p>
          <NightMovieActions item={winner} extended />
        </div>
      </article>
      <div className="night-ranking-heading">
        <h3>Your group’s lineup</h3>
        <span>
          {room.results.length} {room.results.length === 1 ? "movie" : "movies"}{" "}
          ranked
        </span>
      </div>
      <div className="night-ranking-list">
        {room.results
          .slice(0, showAll ? room.results.length : 3)
          .map((item, index) => (
            <article className="night-ranked-movie" key={item.id}>
              <span className="night-rank-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <MoviePoster item={item} />
              <div>
                <h4>{item.title}</h4>
                <p>
                  {item.counts.watch} Watch it · {item.counts.maybe} Maybe ·{" "}
                  {item.counts.pass} Pass
                </p>
                <span>
                  {item.unanimous
                    ? "Everyone wants to watch this"
                    : item.mutual
                      ? "No passes from the crew"
                      : `${item.score}% support`}
                </span>
              </div>
              <div className="night-rank-actions">
                <NightMovieActions item={item} />
              </div>
            </article>
          ))}
      </div>
      {room.results.length > 3 && (
        <button
          className="night-show-all text-button"
          onClick={() => setShowAll((value) => !value)}
        >
          {showAll
            ? "Show top three"
            : "See all " + room.results.length + " matches"}
        </button>
      )}
      <p className="night-help night-centered">
        Fewest passes first, then Watch it (2 points) and Maybe (1 point). Ties
        use genre fit and rating. Individual votes stay private.
      </p>
    </section>
  );
}
export default function MovieNight() {
  const { code } = useParams();
  const history = useHistory();
  const state = useMovieNight(code);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [editing, setEditing] = useState(false);
  const [prefs, setPrefs] = useState(EMPTY_PREFERENCES);
  const [confirm, setConfirm] = useState(null);
  const [ephemeral, setEphemeral] = useState(false);
  const alive = useRef(true);
  useEffect(
    () => () => {
      alive.current = false;
    },
    [],
  );
  const room = state.room;
  const selfId = room?.self?.id;
  const isHost = room?.self?.id === room?.hostId;
  const create = async (values) => {
    if (creating) return;
    setCreating(true);
    setCreateError("");
    try {
      const result = await nightRequest("/rooms", {
        method: "POST",
        data: values,
      });
      if (!alive.current) return;
      rememberRoom(result.room, result.token);
      history.push("/movie-night/" + result.room.code);
    } catch (error) {
      if (alive.current) setCreateError(error.message);
    } finally {
      if (alive.current) setCreating(false);
    }
  };
  useEffect(() => {
    if (selfId) {
      try {
        const probe = "eh-night-storage-check";
        localStorage.setItem(probe, "1");
        localStorage.removeItem(probe);
      } catch {
        setEphemeral(true);
      }
    }
  }, [selfId]);
  if (!code)
    return (
      <div className="movie-night-page">
        <NightSetup onCreate={create} busy={creating} error={createError} />
      </div>
    );
  if (!/^[a-f0-9]{10}$/.test(code))
    return (
      <div className="catalog-state">
        <h1>That invite doesn’t look right.</h1>
        <p>
          Ask your friend for a fresh room link or enter the 10-character room
          code.
        </p>
        <Link to="/movie-night" className="button">
          Find your movie night
        </Link>
      </div>
    );
  if (!room)
    return (
      <div
        className="catalog-state"
        role={state.connectionError ? "alert" : "status"}
      >
        <GroupRoundedIcon />
        <h1>
          {state.loading
            ? "Finding your movie night…"
            : "A brief intermission."}
        </h1>
        <p>{state.connectionError || "Saving a seat for you."}</p>
        {state.connectionError && (
          <>
            {!state.fatal && (
              <button className="button" onClick={state.retry}>
                Reconnect
              </button>
            )}
            <Link to="/movie-night" className="button button-secondary">
              Create another room
            </Link>
          </>
        )}
      </div>
    );
  if (room.preview)
    return (
      <div className="movie-night-page">
        {state.connectionError && (
          <p className="night-error" role="alert">
            {state.connectionError}
          </p>
        )}
        {room.phase === "lobby" ? (
          <NightSetup
            invitation={room}
            onJoin={state.join}
            busy={state.busy}
            error={state.error}
          />
        ) : (
          <div className="catalog-state">
            <GroupRoundedIcon />
            <h1>This movie night is underway.</h1>
            <p>
              Joining closes when voting starts. Ask the host to open a new
              round, or use the browser where you joined to return to your seat.
            </p>
            <Link to="/movie-night" className="button">
              Start your own movie night
            </Link>
          </div>
        )}
      </div>
    );
  return (
    <div className="movie-night-page">
      <div className="night-room-heading">
        <div>
          <Link className="text-link" to="/movie-night">
            ← Movie Night Match
          </Link>
          <h1>
            {room.name}
            <span>.</span>
          </h1>
          <p>
            Round {room.round} · {room.members.length} people ·{" "}
            {room.sourceName
              ? "From " + room.sourceName
              : "A lineup made for your crew"}
          </p>
        </div>
        <NightAvatars members={room.members} />
      </div>
      <ol className="night-steps" aria-label="Movie night progress">
        {[
          ["lobby", "Gather the crew"],
          ["voting", "Cast your votes"],
          ["results", "Meet your matches"],
        ].map(([phase, label], index) => (
          <li
            key={phase}
            className={
              room.phase === phase ||
              (phase === "lobby" && room.phase === "building")
                ? "active"
                : ""
            }
            aria-current={room.phase === phase ? "step" : undefined}
          >
            <span>{index + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      {state.connectionError && (
        <div className="night-connection" role="alert">
          <span>{state.connectionError} We’ll keep trying to reconnect.</span>
          <button className="text-button" onClick={state.retry}>
            Reconnect now
          </button>
        </div>
      )}
      {(!state.persistent || ephemeral) && (
        <p className="night-error" role="status">
          Browser storage is unavailable. Keep this tab open to retain your
          place in the room.
        </p>
      )}
      {state.error && (
        <div className="night-action-error" role="alert">
          <span>{state.error}</span>
          <button className="text-button" onClick={state.clearError}>
            Dismiss
          </button>
        </div>
      )}
      {room.phase === "lobby" && <NightInvite room={room} />}
      {room.phase === "results" ? (
        <>
          <NightResults room={room} />
          {isHost && (
            <div className="night-round-again">
              <div>
                <h3>One more round?</h3>
                <p>Keep the crew and invite link. Start with fresh votes.</p>
              </div>
              <button
                className="button"
                disabled={state.busy || Boolean(state.connectionError)}
                onClick={() => setConfirm({ type: "reset" })}
              >
                Open a new round
                <ArrowForwardRoundedIcon />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="night-room-layout">
          <div>
            {room.phase === "lobby" ? (
              <section className="night-lobby-panel">
                <span className="eyebrow">A LITTLE COMMON GROUND</span>
                <h2>
                  {isHost
                    ? "Ready when your people are."
                    : "You’re on the guest list."}
                </h2>
                <p>
                  {isHost
                    ? "Share the invite, wait for everyone to join, then lock in the lineup. Everyone votes on the same movies."
                    : "The host starts the round once everyone is here. You can update your preferences while you wait."}
                </p>
                {room.conflict ? (
                  <p className="night-error" role="alert">
                    {room.conflict}
                  </p>
                ) : (
                  <div className="night-group-constraints">
                    <span>
                      {room.constraints.minutes
                        ? `Up to ${room.constraints.minutes} minutes`
                        : "Any movie length"}
                    </span>
                    <span>
                      {room.constraints.languages.length
                        ? room.constraints.languages
                            .map(
                              (code) =>
                                LANGUAGES.find(
                                  ([value]) => value === code,
                                )?.[1] || code,
                            )
                            .join(" / ")
                        : "Any language"}
                    </span>
                    <span>Up to 12 movies</span>
                  </div>
                )}
                <button
                  className="button button-secondary"
                  onClick={() => {
                    setPrefs(room.self.preferences);
                    setEditing(true);
                  }}
                >
                  Edit my preferences
                </button>
                {isHost ? (
                  <button
                    className="button night-primary"
                    disabled={
                      room.members.length < 2 ||
                      Boolean(room.conflict) ||
                      state.busy ||
                      Boolean(state.connectionError)
                    }
                    onClick={() => state.act("start")}
                  >
                    <PlayArrowRoundedIcon />
                    {state.busy
                      ? "Building your lineup…"
                      : "Everyone’s here · Start voting"}
                  </button>
                ) : (
                  <p className="night-wait-for-host" role="status">
                    Waiting for the host to start…
                  </p>
                )}
                <p className="night-help">
                  {isHost && room.members.length < 2
                    ? "Invite at least one friend to get started."
                    : "Joining and preference edits close when voting starts."}
                </p>
              </section>
            ) : room.phase === "building" ? (
              <section className="night-building" role="status">
                <span className="night-result-spark" aria-hidden="true">
                  ✦
                </span>
                <h2>Finding your common ground…</h2>
                <p>
                  Choosing a lineup and checking runtimes for the whole crew.
                  This can take a moment.
                </p>
                <div className="skeleton skeleton-line" />
              </section>
            ) : (
              <NightVoting
                key={room.round}
                room={room}
                busy={state.busy || Boolean(state.connectionError)}
                onVote={(titleId, choice) =>
                  state.act("votes", "PUT", { titleId, choice })
                }
              />
            )}
          </div>
          <div>
            <NightMembers
              room={room}
              busy={state.busy || Boolean(state.connectionError)}
              onRemove={(member) => setConfirm({ type: "remove", member })}
            />
            {isHost && room.phase === "voting" && (
              <button
                className="night-reset-link text-button"
                disabled={state.busy}
                onClick={() => setConfirm({ type: "reset" })}
              >
                Reopen lobby & start a fresh round
              </button>
            )}
          </div>
        </div>
      )}
      <Dialog
        open={editing && room.phase === "lobby"}
        onClose={() => {
          if (!state.busy) setEditing(false);
        }}
        maxWidth={false}
        PaperProps={{ className: "night-dialog" }}
        aria-labelledby="night-edit-heading"
      >
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const next = await state.act("preferences", "PUT", prefs);
            if (next) setEditing(false);
          }}
        >
          <div className="night-dialog-heading">
            <h2 id="night-edit-heading">Make it your kind of night.</h2>
            <button
              type="button"
              className="collection-close"
              aria-label="Close movie night preferences"
              disabled={state.busy}
              onClick={() => setEditing(false)}
            >
              <CloseRoundedIcon />
            </button>
          </div>
          <NightPreferences
            value={prefs}
            onChange={setPrefs}
            disabled={state.busy}
          />
          {state.error && (
            <p className="night-error" role="alert">
              {state.error}
            </p>
          )}
          <div className="night-dialog-footer">
            <button
              className="text-button"
              type="button"
              disabled={state.busy}
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
            <button className="button" type="submit" disabled={state.busy}>
              Save preferences
            </button>
          </div>
        </form>
      </Dialog>
      <Dialog
        open={Boolean(confirm)}
        onClose={() => {
          if (!state.busy) setConfirm(null);
        }}
        maxWidth={false}
        PaperProps={{ className: "night-dialog night-confirm" }}
        aria-labelledby="night-confirm-heading"
      >
        <h2 id="night-confirm-heading">
          {confirm?.type === "reset"
            ? "Open a fresh round?"
            : `Remove ${confirm?.member.name}?`}
        </h2>
        <p>
          {confirm?.type === "reset"
            ? "This clears everyone’s votes and reopens the lobby. Your group, preferences, and invite link stay together."
            : "They’ll lose their seat and their votes will be discarded. They can rejoin while the lobby is open."}
        </p>
        {state.error && (
          <p className="night-error" role="alert">
            {state.error}
          </p>
        )}
        <div className="night-dialog-footer">
          <button
            className="text-button"
            disabled={state.busy}
            onClick={() => setConfirm(null)}
          >
            Cancel
          </button>
          <button
            className="button"
            disabled={state.busy}
            onClick={async () => {
              const next =
                confirm.type === "reset"
                  ? await state.act("reset")
                  : await state.act("members/" + confirm.member.id, "DELETE");
              if (next) setConfirm(null);
            }}
          >
            {confirm?.type === "reset"
              ? "Open new round"
              : "Remove participant"}
          </button>
        </div>
      </Dialog>
    </div>
  );
}
