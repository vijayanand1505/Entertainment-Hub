const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const {
  RoomStore,
  RoomService,
  constraints,
  rankings,
} = require("./rooms.cjs");
const { createRoomServer } = require("./http.cjs");
const { createCatalog, normalizeMovie } = require("./catalog.cjs");
const prefs = (languages = [], minutes = null, genres = []) => ({
  languages,
  minutes,
  genres,
});
const movie = (id, extra = {}) => ({
  id,
  title: "Movie " + id,
  media_type: "movie",
  runtime: 100,
  release_date: "2020-01-01",
  original_language: "en",
  poster_path: null,
  backdrop_path: null,
  overview: "A story",
  genres: [{ id: 35, name: "Comedy" }],
  vote_average: 8,
  genreMatches: 2,
  ...extra,
});
const service = (build = async () => [movie(1), movie(2), movie(3)], file) =>
  new RoomService(new RoomStore(file), build);
const host = (app, preferences = prefs()) =>
  app.create({ name: "Friday night", displayName: "Vijay", preferences });
const guest = (app, code, name = "Anu", preferences = prefs()) =>
  app.join(code, { displayName: name, preferences });
const expectError = (fn, status, match) =>
  assert.throws(
    fn,
    (error) => error.status === status && (!match || match.test(error.message)),
  );

test("two participants vote privately, can revise votes, and reveal only after everyone finishes", async () => {
  const app = service();
  const owner = host(app);
  const code = owner.room.code;
  const friend = guest(app, code);
  await app.start(code, owner.token);
  for (const id of [1, 2, 3])
    app.vote(code, owner.token, {
      titleId: id,
      choice: id === 1 ? "watch" : "maybe",
    });
  let visible = app.get(code, friend.token);
  assert.equal(visible.phase, "voting");
  assert.equal(visible.results, null);
  assert.deepEqual(visible.self.votes, {});
  assert.equal(visible.members[0].votedCount, 3);
  assert(!JSON.stringify(visible.members).includes("votes"));
  assert(!JSON.stringify(visible).includes("tokenHash"));
  app.vote(code, friend.token, { titleId: 1, choice: "maybe" });
  app.vote(code, friend.token, { titleId: 1, choice: "watch" });
  assert.equal(app.get(code, friend.token).members[1].votedCount, 1);
  app.vote(code, friend.token, { titleId: 2, choice: "pass" });
  visible = app.vote(code, friend.token, { titleId: 3, choice: "maybe" });
  assert.equal(visible.phase, "results");
  assert.equal(visible.results[0].id, 1);
  assert.equal(visible.results[0].unanimous, true);
  assert.equal(visible.results[0].score, 100);
  assert.equal(visible.results[2].id, 2);
  assert.equal(visible.results[2].mutual, false);
  expectError(
    () => app.vote(code, friend.token, { titleId: 1, choice: "pass" }),
    409,
  );
  const anonymous = app.get(code);
  assert(anonymous.preview);
  assert.equal(anonymous.members, undefined);
  assert.equal(anonymous.results, undefined);
  assert.equal(anonymous.deck, undefined);
});
test("host permissions, duplicate names, unknown titles, invalid votes, and phase transitions are enforced", async () => {
  const app = service();
  const owner = host(app);
  const code = owner.room.code;
  expectError(
    () => app.join(code, { displayName: "VIJAY", preferences: prefs() }),
    409,
  );
  const friend = guest(app, code);
  await assert.rejects(
    app.start(code, friend.token),
    (error) => error.status === 403,
  );
  expectError(() => app.reset(code, friend.token), 403);
  expectError(() => app.remove(code, friend.token, owner.room.hostId), 403);
  expectError(() => app.get(code, "invalid"), 403);
  expectError(
    () => app.vote(code, owner.token, { titleId: 1, choice: "watch" }),
    409,
  );
  await app.start(code, owner.token);
  expectError(() => guest(app, code, "Late"), 409);
  expectError(() => app.updatePreferences(code, friend.token, prefs()), 409);
  expectError(
    () => app.vote(code, friend.token, { titleId: 999, choice: "watch" }),
    400,
  );
  expectError(
    () => app.vote(code, friend.token, { titleId: 1, choice: "hacked" }),
    400,
  );
  const next = app.reset(code, owner.token);
  assert.equal(next.phase, "lobby");
  assert.equal(next.round, 2);
  assert.equal(next.deck.length, 0);
  assert.equal(next.members.length, 2);
  assert.deepEqual(next.self.votes, {});
});
test("group constraints intersect languages and use the shortest time; conflicts are recoverable", async () => {
  const app = service();
  const owner = host(app, prefs(["en", "ta"], 180, [35]));
  const friend = guest(app, owner.room.code, "Anu", prefs(["ta"], 120, [18]));
  const room = app.store.get(owner.room.code);
  assert.deepEqual(constraints(room.members), {
    languages: ["ta"],
    minutes: 120,
    genres: [35, 18],
  });
  app.updatePreferences(room.code, friend.token, prefs(["fr"], 90));
  await assert.rejects(
    app.start(room.code, owner.token),
    (error) => error.status === 409 && /shared language/.test(error.message),
  );
  assert.equal(app.get(room.code, owner.token).phase, "lobby");
  app.updatePreferences(room.code, friend.token, prefs());
  await app.start(room.code, owner.token);
  assert.equal(app.get(room.code, friend.token).phase, "voting");
});
test("empty or failing catalogs unlock the lobby and concurrent starts cannot build different decks", async () => {
  const empty = service(async () => []);
  const owner = host(empty);
  guest(empty, owner.room.code);
  await assert.rejects(
    empty.start(owner.room.code, owner.token),
    (error) => error.status === 422,
  );
  assert.equal(empty.get(owner.room.code, owner.token).phase, "lobby");
  let resolve;
  let calls = 0;
  const app = service(() => {
    calls++;
    return new Promise((done) => {
      resolve = done;
    });
  });
  const host2 = host(app);
  guest(app, host2.room.code);
  const pending = app.start(host2.room.code, host2.token);
  await assert.rejects(
    app.start(host2.room.code, host2.token),
    (error) => error.status === 409,
  );
  resolve([movie(1)]);
  await pending;
  assert.equal(calls, 1);
  assert.equal(app.get(host2.room.code, host2.token).deck.length, 1);
});
test("rooms persist across restart, tokens are hashed, expired rooms cannot be resumed, and interrupted builds recover", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "eh-movie-night-"));
  const file = path.join(directory, "rooms.json");
  try {
    const app = service(undefined, file);
    const owner = host(app);
    guest(app, owner.room.code);
    await app.start(owner.room.code, owner.token);
    app.vote(owner.room.code, owner.token, { titleId: 1, choice: "watch" });
    assert(!fs.readFileSync(file, "utf8").includes(owner.token));
    const restarted = service(undefined, file);
    assert.equal(
      restarted.get(owner.room.code, owner.token).self.votes[1],
      "watch",
    );
    restarted.store.transaction((rooms) => {
      rooms[owner.room.code].phase = "building";
    });
    assert.equal(
      service(undefined, file).get(owner.room.code, owner.token).phase,
      "lobby",
    );
    restarted.store.rooms[owner.room.code].expiresAt = 0;
    expectError(() => restarted.get(owner.room.code, owner.token), 410);
    expectError(() => restarted.get("0000000000"), 404);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
test("removing a participant discards their votes and can finish a round without exposing choices", async () => {
  const app = service(async () => [movie(1)]);
  const owner = host(app);
  const friend = guest(app, owner.room.code);
  const third = guest(app, owner.room.code, "Sam");
  await app.start(owner.room.code, owner.token);
  app.vote(owner.room.code, owner.token, { titleId: 1, choice: "watch" });
  app.vote(owner.room.code, friend.token, { titleId: 1, choice: "watch" });
  const result = app.remove(owner.room.code, owner.token, third.room.self.id);
  assert.equal(result.phase, "results");
  assert.equal(result.results[0].unanimous, true);
  assert.equal(result.memberCount, 2);
  expectError(() => app.get(owner.room.code, third.token), 403);
});
test("all-pass rounds are described as closest matches, never unanimous picks", () => {
  const room = {
    members: [{ votes: { 1: "pass" } }, { votes: { 1: "pass" } }],
    deck: [movie(1)],
  };
  const result = rankings(room)[0];
  assert.equal(result.unanimous, false);
  assert.equal(result.mutual, false);
  assert.equal(result.score, 0);
});
test("movie metadata is checked against runtime, language, release date and content constraints", () => {
  const members = [{ preferences: prefs(["en"], 120, [35]) }];
  const shared = constraints(members);
  const today = "2026-10-27";
  assert(normalizeMovie(movie(1), members, shared, today));
  for (const bad of [
    { runtime: 155 },
    { runtime: 0 },
    { original_language: "ta" },
    { adult: true },
    { release_date: "2028-01-01" },
  ])
    assert.equal(normalizeMovie(movie(1, bad), members, shared, today), null);
});
test("collection decks fetch actual metadata, skip unsuitable titles, and preserve source IDs", async () => {
  const calls = [];
  const transport = {
    get: async (url) => {
      calls.push(url);
      return {
        data: movie(Number(url.split("/").pop()), {
          runtime: url.endsWith("/2") ? 155 : 100,
        }),
      };
    },
  };
  const build = createCatalog("test-key", transport);
  const members = [{ preferences: prefs(["en"], 120, [35]) }];
  const deck = await build({
    source: { ids: [1, 2, 3] },
    members,
    shared: constraints(members),
  });
  assert.deepEqual(
    deck.map((item) => item.id),
    [1, 3],
  );
  assert.equal(calls.length, 3);
  assert(!calls.some((url) => url.includes("discover")));
});
test("HTTP room API keeps anonymous previews private and rejects unauthenticated or malformed actions", async () => {
  const app = service();
  const server = createRoomServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/movie-night`;
  const request = async (route, method = "GET", data, token) => {
    const response = await fetch(base + route, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      ...(data === undefined ? {} : { body: JSON.stringify(data) }),
    });
    return { status: response.status, body: await response.json() };
  };
  try {
    const created = await request("/rooms", "POST", {
      name: "HTTP night",
      displayName: "Host",
      preferences: prefs(),
    });
    assert.equal(created.status, 201);
    const code = created.body.room.code;
    const preview = await request("/rooms/" + code);
    assert(preview.body.preview);
    assert.equal(preview.body.self, undefined);
    const unauthorized = await request("/rooms/" + code + "/start", "POST", {});
    assert.equal(unauthorized.status, 401);
    const joined = await request("/rooms/" + code + "/join", "POST", {
      displayName: "Guest",
      preferences: prefs(),
    });
    assert.equal(joined.status, 201);
    const denied = await request(
      "/rooms/" + code + "/start",
      "POST",
      {},
      joined.body.token,
    );
    assert.equal(denied.status, 403);
    assert.equal(
      (
        await request(
          "/rooms/" + code + "/start",
          "POST",
          {},
          created.body.token,
        )
      ).status,
      200,
    );
    const large = await request("/rooms", "POST", { name: "x".repeat(20000) });
    assert.equal(large.status, 413);
    assert.equal((await request("/rooms/no-such-room")).status, 404);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});

test("movie-night rooms validate and retain the host's subscription filter", () => {
  const app = service();
  const result = app.create({
    name: "Subscriptions",
    displayName: "Host",
    preferences: prefs(),
    streaming: { region: "IN", providers: [8, 9, 8] },
  });
  assert.deepEqual(result.room.streaming, { region: "IN", providers: [8, 9] });
  assert.deepEqual(app.get(result.room.code).streaming, result.room.streaming);
  for (const streaming of [
    { region: "invalid", providers: [8] },
    { region: "IN", providers: [-1] },
    { region: "IN", providers: [] },
  ]) {
    assert.throws(
      () =>
        app.create({
          name: "Invalid",
          displayName: "Host",
          preferences: prefs(),
          streaming,
        }),
      (e) => e.status === 400,
    );
  }
});
test("collection movie nights exclude rentals and availability in another country", async () => {
  const members = [{ preferences: prefs() }];
  const transport = {
    get: async (url) => {
      const id = Number(url.match(/movie\/(\d+)/)?.[1]);
      if (url.endsWith("/watch/providers"))
        return {
          data: {
            results:
              id === 1
                ? { IN: { rent: [{ provider_id: 8 }] } }
                : id === 2
                  ? { IN: { flatrate: [{ provider_id: 8 }] } }
                  : { US: { flatrate: [{ provider_id: 8 }] } },
          },
        };
      return { data: movie(id) };
    },
  };
  const result = await createCatalog(
    "test-key",
    transport,
  )({
    source: { ids: [1, 2, 3] },
    members,
    shared: constraints(members),
    streaming: { region: "IN", providers: [8] },
  });
  assert.deepEqual(
    result.map((item) => item.id),
    [2],
  );
});
test("group discovery sends an OR filter for subscriptions and verifies the returned title", async () => {
  const members = [{ preferences: prefs() }];
  let discover;
  const transport = {
    get: async (url, options) => {
      if (url.endsWith("discover/movie")) {
        discover = options.params;
        return { data: { results: [{ id: 2 }] } };
      }
      if (url.endsWith("watch/providers"))
        return {
          data: { results: { IN: { flatrate: [{ provider_id: 9 }] } } },
        };
      return { data: movie(2) };
    },
  };
  const result = await createCatalog(
    "test-key",
    transport,
  )({
    source: null,
    members,
    shared: constraints(members),
    streaming: { region: "IN", providers: [8, 9] },
  });
  assert.equal(discover.watch_region, "IN");
  assert.equal(discover.with_watch_providers, "8|9");
  assert.equal(discover.with_watch_monetization_types, "flatrate");
  assert.equal(result.length, 1);
});
