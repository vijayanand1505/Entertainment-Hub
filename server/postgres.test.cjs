const { test } = require("node:test");
const assert = require("node:assert/strict");
const { Pool } = require("pg");
const { PostgresRoomService } = require("./postgres.cjs");
const { createRoomHandler } = require("./http.cjs");
const enabled = Boolean(process.env.ROOMS_TEST_DATABASE_URL);
const deck = [{ id: 550, title: "Test movie", genres: [], vote_average: 8 }];

async function database(t) {
  const pool = new Pool({ connectionString: process.env.ROOMS_TEST_DATABASE_URL, max: 5 });
  const codes = [];
  t.after(async () => {
    for (const code of codes)
      await pool.query("DELETE FROM entertainment_hub_rooms WHERE code = $1", [code]);
    await pool.end();
  });
  const app = new PostgresRoomService(pool, async () => deck);
  const owner = await app.create({ name: "Deployment test", displayName: "Host" });
  codes.push(owner.room.code);
  return { pool, app, owner, code: owner.room.code };
}

test("Postgres preserves concurrent joins across service instances and stores only token hashes", { skip: !enabled }, async (t) => {
  const { pool, app, owner, code } = await database(t);
  const secondInstance = new PostgresRoomService(pool, async () => deck);
  const joined = await Promise.all([
    app.join(code, { displayName: "Guest one" }),
    secondInstance.join(code, { displayName: "Guest two" }),
  ]);
  const restored = await secondInstance.get(code, owner.token);
  assert.equal(restored.members.length, 3);
  assert.equal(restored.self.id, owner.room.hostId);
  const stored = await pool.query("SELECT state FROM entertainment_hub_rooms WHERE code = $1", [code]);
  for (const value of [owner, ...joined])
    assert(!JSON.stringify(stored.rows[0].state).includes(value.token));
  const preview = await app.get(code);
  assert.equal(preview.members, undefined);
  assert.equal(preview.self, undefined);
});

test("Postgres serializes simultaneous votes and rolls back forbidden changes", { skip: !enabled }, async (t) => {
  const { pool, app, owner, code } = await database(t);
  const other = new PostgresRoomService(pool, async () => deck);
  const friend = await other.join(code, { displayName: "Guest" });
  await app.start(code, owner.token);
  await Promise.all([
    app.vote(code, owner.token, { titleId: 550, choice: "watch" }),
    other.vote(code, friend.token, { titleId: 550, choice: "watch" }),
  ]);
  const result = await other.get(code, owner.token);
  assert.equal(result.phase, "results");
  assert.equal(result.results[0].unanimous, true);
  assert.equal(result.results[0].counts.watch, 2);
  await assert.rejects(other.reset(code, friend.token), (error) => error.status === 403);
  assert.equal((await app.get(code, owner.token)).phase, "results");
  assert.equal((await app.reset(code, owner.token)).phase, "lobby");
});

test("the serverless handler awaits database actions and accepts Vercel-parsed JSON bodies", async () => {
  let submitted;
  const handler = createRoomHandler({
    create: async (body) => {
      submitted = body;
      return { room: { code: "aabbccddee" } };
    },
  });
  const request = {
    method: "POST",
    url: "/api/movie-night/rooms",
    headers: { "content-type": "application/json" },
    socket: { remoteAddress: "127.0.0.1" },
    body: { name: "Friday", displayName: "Host" },
  };
  const response = {
    writeHead(status) { this.status = status; },
    end(body) { this.body = JSON.parse(body); },
  };
  await handler(request, response);
  assert.equal(response.status, 201);
  assert.equal(response.body.room.code, "aabbccddee");
  assert.deepEqual(submitted, request.body);
  await handler({ ...request, body: { name: "x".repeat(17 * 1024) } }, response);
  assert.equal(response.status, 413);
});
