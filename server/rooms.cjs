const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

class RoomError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const fail = (status, message) => {
  throw new RoomError(status, message);
};
const GENRES = new Set([
  28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878, 10770,
  53, 10752, 37,
]);
const LANGUAGES = new Set([
  "en",
  "hi",
  "ta",
  "te",
  "ml",
  "kn",
  "bn",
  "mr",
  "pa",
  "ko",
  "ja",
  "fr",
  "es",
  "de",
  "zh",
  "it",
  "pt",
  "ar",
  "tr",
  "th",
]);
const text = (value, limit) =>
  typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").slice(0, limit)
    : "";
const hash = (token) => crypto.createHash("sha256").update(token).digest("hex");
const secret = () => crypto.randomBytes(32).toString("base64url");
function preferences(value = {}) {
  if (!value || typeof value !== "object")
    fail(400, "Please check your preferences.");
  const genres = Array.isArray(value.genres) ? [...new Set(value.genres)] : [];
  const languages = Array.isArray(value.languages)
    ? [...new Set(value.languages)]
    : [];
  const minutes =
    value.minutes === "" || value.minutes == null
      ? null
      : Number(value.minutes);
  if (genres.length > 6 || genres.some((id) => !GENRES.has(id)))
    fail(400, "Choose up to six genres.");
  if (languages.some((code) => !LANGUAGES.has(code)) || languages.length > 20)
    fail(400, "Choose valid languages.");
  if (minutes !== null && ![90, 120, 150, 180, 240].includes(minutes))
    fail(400, "Choose a valid time limit.");
  return { genres, languages, minutes };
}
function constraints(members) {
  const specific = members
    .map((member) => member.preferences.languages)
    .filter((list) => list.length);
  const languages = specific.length
    ? specific[0].filter((code) =>
        specific.every((list) => list.includes(code)),
      )
    : [];
  if (specific.length && !languages.length)
    fail(
      409,
      "There’s no shared language yet. Update your preferences to include a language everyone can watch, or choose any language.",
    );
  const limits = members
    .map((member) => member.preferences.minutes)
    .filter(Boolean);
  return {
    languages,
    minutes: limits.length ? Math.min(...limits) : null,
    genres: [
      ...new Set(members.flatMap((member) => member.preferences.genres)),
    ],
  };
}
function member(room, token) {
  if (typeof token !== "string" || token.length < 20 || token.length > 100)
    fail(
      403,
      "Your room session is unavailable. Join again if the lobby is open.",
    );
  const digest = hash(token);
  const found = room.members.find((entry) =>
    crypto.timingSafeEqual(
      Buffer.from(entry.tokenHash, "hex"),
      Buffer.from(digest, "hex"),
    ),
  );
  if (!found) fail(403, "You’re no longer a participant in this room.");
  return found;
}
function host(room, token) {
  const self = member(room, token);
  if (self.id !== room.hostId) fail(403, "Only the host can do that.");
  return self;
}
function complete(room) {
  return (
    room.members.length >= 2 &&
    room.deck.length > 0 &&
    room.members.every((entry) =>
      room.deck.every((item) =>
        ["watch", "maybe", "pass"].includes(entry.votes[item.id]),
      ),
    )
  );
}
function rankings(room) {
  return room.deck
    .map((item) => {
      const counts = { watch: 0, maybe: 0, pass: 0 };
      const genreMatches = room.members.filter((member) =>
        (member.preferences?.genres || []).some((id) =>
          (item.genres || []).some((genre) => genre.id === id),
        ),
      ).length;
      room.members.forEach((entry) => {
        if (counts[entry.votes[item.id]] !== undefined)
          counts[entry.votes[item.id]]++;
      });
      return {
        ...item,
        genreMatches,
        counts,
        unanimous: counts.watch === room.members.length,
        mutual: counts.pass === 0,
        score: Math.round(
          ((counts.watch * 2 + counts.maybe) / (room.members.length * 2)) * 100,
        ),
      };
    })
    .sort(
      (a, b) =>
        a.counts.pass - b.counts.pass ||
        b.score - a.score ||
        b.genreMatches - a.genreMatches ||
        b.vote_average - a.vote_average ||
        a.id - b.id,
    );
}
function view(room, self) {
  const preview = {
    code: room.code,
    name: room.name,
    phase: room.phase,
    memberCount: room.members.length,
    expiresAt: room.expiresAt,
    round: room.round,
    streaming: room.streaming || null,
  };
  if (!self) return { ...preview, preview: true };
  let shared = null;
  let conflict = "";
  try {
    shared = constraints(room.members);
  } catch (error) {
    conflict = error.message;
  }
  return {
    ...preview,
    hostId: room.hostId,
    sourceName: room.source?.name || "",
    members: room.members.map((entry) => ({
      id: entry.id,
      name: entry.name,
      preferences: entry.preferences,
      votedCount: room.deck.filter((item) => Boolean(entry.votes[item.id]))
        .length,
    })),
    self: {
      id: self.id,
      preferences: self.preferences,
      votes: { ...self.votes },
    },
    deck: room.phase === "lobby" || room.phase === "building" ? [] : room.deck,
    constraints: shared,
    conflict,
    results: room.phase === "results" ? rankings(room) : null,
  };
}
class RoomStore {
  constructor(filename) {
    this.filename = filename;
    this.rooms = {};
    if (filename && fs.existsSync(filename)) {
      const data = JSON.parse(fs.readFileSync(filename, "utf8"));
      if (
        data.version !== 1 ||
        !data.rooms ||
        typeof data.rooms !== "object" ||
        Array.isArray(data.rooms)
      )
        throw new Error(
          "Invalid movie night storage. Restore a valid backup before starting.",
        );
      this.rooms = data.rooms;
      for (const room of Object.values(this.rooms))
        if (room.phase === "building") room.phase = "lobby";
    }
  }
  get(code, now = Date.now()) {
    const room = this.rooms[code];
    if (!room)
      fail(
        404,
        "This movie night wasn’t found. Check the invite link or room code.",
      );
    if (room.expiresAt <= now)
      fail(
        410,
        "This movie night has expired. Create a fresh room for your next night in.",
      );
    return room;
  }
  transaction(change) {
    const next = JSON.parse(JSON.stringify(this.rooms));
    for (const [code, room] of Object.entries(next))
      if (room.expiresAt <= Date.now()) delete next[code];
    const result = change(next);
    if (this.filename) {
      fs.mkdirSync(path.dirname(this.filename), {
        recursive: true,
        mode: 0o700,
      });
      const temp = this.filename + ".tmp";
      fs.writeFileSync(temp, JSON.stringify({ version: 1, rooms: next }), {
        mode: 0o600,
      });
      fs.renameSync(temp, this.filename);
    }
    this.rooms = next;
    return result;
  }
}
class RoomService {
  constructor(store, buildDeck) {
    this.store = store;
    this.buildDeck = buildDeck;
  }
  get(code, token) {
    const room = this.store.get(code);
    return view(room, token ? member(room, token) : null);
  }
  create(body) {
    const name = text(body.name, 60);
    const displayName = text(body.displayName, 30);
    if (!name || !displayName)
      fail(400, "Give your movie night and yourself a name.");
    const prefs = preferences(body.preferences);
    let streaming = null;
    if (body.streaming != null) {
      const { region, providers } = body.streaming;
      if (
        !/^[A-Z]{2}$/.test(region || "") ||
        !Array.isArray(providers) ||
        !providers.length ||
        providers.length > 50 ||
        providers.some((id) => !Number.isSafeInteger(id) || id <= 0)
      )
        fail(400, "Choose a country and valid streaming services.");
      streaming = { region, providers: [...new Set(providers)] };
    }
    const token = secret();
    const code = crypto.randomBytes(5).toString("hex");
    const id = crypto.randomBytes(8).toString("hex");
    let source = null;
    if (body.source) {
      const ids = Array.isArray(body.source.ids)
        ? [...new Set(body.source.ids)]
            .filter((value) => Number.isSafeInteger(value) && value > 0)
            .slice(0, 30)
        : [];
      if (!ids.length)
        fail(400, "Choose a collection with at least one movie.");
      source = { name: text(body.source.name, 60) || "Your collection", ids };
    }
    const room = {
      code,
      name,
      hostId: id,
      phase: "lobby",
      round: 1,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      source,
      streaming,
      members: [
        {
          id,
          name: displayName,
          tokenHash: hash(token),
          preferences: prefs,
          votes: {},
        },
      ],
      deck: [],
    };
    this.store.transaction((rooms) => {
      if (Object.keys(rooms).length >= 200)
        fail(503, "Movie nights are full right now. Please try again later.");
      rooms[code] = room;
    });
    return { token, room: view(room, room.members[0]) };
  }
  join(code, body) {
    this.store.get(code);
    const displayName = text(body.displayName, 30);
    if (!displayName) fail(400, "Tell the room what to call you.");
    const prefs = preferences(body.preferences);
    const token = secret();
    return this.store.transaction((rooms) => {
      const room = rooms[code];
      if (room.phase !== "lobby")
        fail(
          409,
          "Voting has already started. Ask the host to open a new round before joining.",
        );
      if (room.members.length >= 12)
        fail(409, "This room already has 12 people.");
      if (
        room.members.some(
          (entry) =>
            entry.name.toLocaleLowerCase() === displayName.toLocaleLowerCase(),
        )
      )
        fail(
          409,
          "Someone in this room already uses that name. Choose another name.",
        );
      const self = {
        id: crypto.randomBytes(8).toString("hex"),
        name: displayName,
        tokenHash: hash(token),
        preferences: prefs,
        votes: {},
      };
      room.members.push(self);
      return { token, room: view(room, self) };
    });
  }
  updatePreferences(code, token, body) {
    this.store.get(code);
    const prefs = preferences(body);
    return this.store.transaction((rooms) => {
      const room = rooms[code];
      const self = member(room, token);
      if (room.phase !== "lobby")
        fail(409, "Preferences are locked for this round.");
      self.preferences = prefs;
      return view(room, self);
    });
  }
  async start(code, token) {
    this.store.get(code);
    const snapshot = this.store.transaction((rooms) => {
      const room = rooms[code];
      host(room, token);
      if (room.phase !== "lobby") fail(409, "This round has already started.");
      if (room.members.length < 2)
        fail(409, "Invite at least one friend before starting.");
      const shared = constraints(room.members);
      room.phase = "building";
      return { ...JSON.parse(JSON.stringify(room)), shared };
    });
    try {
      const deck = await this.buildDeck(snapshot);
      if (!deck.length)
        fail(
          422,
          "No movies fit this group yet. Try allowing more time, adding a shared language, or a different collection.",
        );
      return this.store.transaction((rooms) => {
        const room = rooms[code];
        if (!room || room.phase !== "building" || room.round !== snapshot.round)
          fail(409, "This round has changed. Refresh the room.");
        room.deck = deck.slice(0, 12);
        room.phase = "voting";
        room.members.forEach((entry) => {
          entry.votes = {};
        });
        return view(room, member(room, token));
      });
    } catch (error) {
      this.store.transaction((rooms) => {
        const room = rooms[code];
        if (room?.phase === "building" && room.round === snapshot.round)
          room.phase = "lobby";
      });
      throw error;
    }
  }
  vote(code, token, body) {
    this.store.get(code);
    return this.store.transaction((rooms) => {
      const room = rooms[code];
      const self = member(room, token);
      if (room.phase !== "voting")
        fail(409, "Voting is closed for this round.");
      if (
        !Number.isSafeInteger(body.titleId) ||
        !room.deck.some((item) => item.id === body.titleId) ||
        !["watch", "maybe", "pass"].includes(body.choice)
      )
        fail(400, "Choose Watch it, Maybe, or Pass for a movie in this round.");
      self.votes[body.titleId] = body.choice;
      if (complete(room)) room.phase = "results";
      return view(room, self);
    });
  }
  reset(code, token) {
    this.store.get(code);
    return this.store.transaction((rooms) => {
      const room = rooms[code];
      host(room, token);
      if (room.phase === "building")
        fail(409, "Wait for the current lineup to finish loading.");
      room.phase = "lobby";
      room.round++;
      room.deck = [];
      room.members.forEach((entry) => {
        entry.votes = {};
      });
      return view(room, member(room, token));
    });
  }
  remove(code, token, id) {
    this.store.get(code);
    return this.store.transaction((rooms) => {
      const room = rooms[code];
      host(room, token);
      if (!["lobby", "voting"].includes(room.phase))
        fail(
          409,
          "Participants can only be removed in the lobby or during voting.",
        );
      if (id === room.hostId) fail(400, "The host stays with the room.");
      if (!room.members.some((entry) => entry.id === id))
        fail(404, "This participant has already left.");
      if (room.phase === "voting" && room.members.length <= 2)
        fail(
          409,
          "A voting round needs two people. Open a new round to change the group.",
        );
      room.members = room.members.filter((entry) => entry.id !== id);
      if (room.phase === "voting" && complete(room)) room.phase = "results";
      return view(room, member(room, token));
    });
  }
}
module.exports = {
  RoomStore,
  RoomService,
  RoomError,
  constraints,
  preferences,
  rankings,
  view,
};
