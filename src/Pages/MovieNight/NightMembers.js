import { LANGUAGES } from "../../utils/discovery";
import { MOVIE_GENRES } from "../../utils/movieNight";
export function NightAvatars({ members }) {
  return (
    <div
      className="night-avatars"
      aria-label={members.map((member) => member.name).join(", ")}
    >
      {members.map((member, index) => (
        <span
          key={member.id}
          style={{ "--avatar-color": `var(--night-avatar-${index % 6})` }}
          title={member.name}
          aria-hidden="true"
        >
          {member.name.slice(0, 1).toUpperCase()}
        </span>
      ))}
    </div>
  );
}
export default function NightMembers({ room, onRemove, busy }) {
  const isHost = room.self.id === room.hostId;
  return (
    <section
      className="night-member-panel"
      aria-labelledby="night-people-heading"
    >
      <div className="night-panel-heading">
        <h2 id="night-people-heading">Participants</h2>
        <span>{room.members.length}/12</span>
      </div>
      <div className="night-member-list">
        {room.members.map((member, index) => (
          <div className="night-member" key={member.id}>
            <span
              className="night-avatar"
              style={{ "--avatar-color": `var(--night-avatar-${index % 6})` }}
              aria-hidden="true"
            >
              {member.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="night-member-copy">
              <strong>
                {member.name}
                {member.id === room.self.id && <small> you</small>}
                {member.id === room.hostId && <em>Host</em>}
              </strong>
              <p>
                {room.phase === "lobby"
                  ? `${member.preferences.languages.length ? member.preferences.languages.map((code) => LANGUAGES.find(([value]) => value === code)?.[1] || code).join(", ") : "Any language"} · ${member.preferences.minutes ? member.preferences.minutes + " min" : "Any length"}`
                  : `${member.votedCount}/${room.deck.length} votes${member.votedCount === room.deck.length ? " · Done ✓" : ""}`}
              </p>
              {room.phase === "lobby" && (
                <span>
                  {member.preferences.genres.length
                    ? member.preferences.genres
                        .map(
                          (id) =>
                            MOVIE_GENRES.find(([value]) => value === id)?.[1],
                        )
                        .join(" · ")
                    : "Open to every genre"}
                </span>
              )}
            </div>
            {isHost &&
              member.id !== room.self.id &&
              ["lobby", "voting"].includes(room.phase) && (
                <button
                  className="night-remove-person"
                  disabled={busy}
                  aria-label={`Remove ${member.name} from movie night`}
                  onClick={() => onRemove(member)}
                >
                  ×
                </button>
              )}
          </div>
        ))}
      </div>
      <p className="night-help">
        {room.phase === "lobby"
          ? "The host can start voting once everyone has joined."
          : "Progress is shared. Individual choices stay private."}
      </p>
    </section>
  );
}
