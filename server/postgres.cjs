const { RoomStore, RoomService } = require("./rooms.cjs");

// Reuse the same room rules locally and on Vercel. A database row lock keeps
// concurrent votes and host actions from overwriting each other's changes.
class PostgresRoomService {
  constructor(pool, buildDeck) {
    this.pool = pool;
    this.buildDeck = buildDeck;
    this.initialized = null;
  }
  async ready() {
    if (!this.initialized) {
      this.initialized = this.pool.query(`
        CREATE TABLE IF NOT EXISTS entertainment_hub_rooms (
          code text PRIMARY KEY,
          state jsonb NOT NULL,
          expires_at timestamptz NOT NULL
        )
      `).catch((error) => {
        this.initialized = null;
        throw error;
      });
    }
    await this.initialized;
  }
  local(state) {
    const store = new RoomStore();
    if (state) store.rooms[state.code] = state;
    return new RoomService(store, this.buildDeck);
  }
  async create(body) {
    await this.ready();
    const service = this.local();
    const result = service.create(body);
    const state = service.store.rooms[result.room.code];
    await this.pool.query(
      "DELETE FROM entertainment_hub_rooms WHERE expires_at <= now()",
    );
    await this.pool.query(
      "INSERT INTO entertainment_hub_rooms (code, state, expires_at) VALUES ($1, $2::jsonb, $3)",
      [state.code, JSON.stringify(state), new Date(state.expiresAt)],
    );
    return result;
  }
  async get(code, token) {
    await this.ready();
    const { rows } = await this.pool.query(
      "SELECT state FROM entertainment_hub_rooms WHERE code = $1",
      [code],
    );
    return this.local(rows[0]?.state).get(code, token);
  }
  async change(code, action, ...args) {
    await this.ready();
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query(
        "SELECT state FROM entertainment_hub_rooms WHERE code = $1 FOR UPDATE",
        [code],
      );
      const service = this.local(rows[0]?.state);
      const result = await service[action](code, ...args);
      await client.query(
        "UPDATE entertainment_hub_rooms SET state = $2::jsonb WHERE code = $1",
        [code, JSON.stringify(service.store.rooms[code])],
      );
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }
  join(code, body) {
    return this.change(code, "join", body);
  }
  updatePreferences(code, token, body) {
    return this.change(code, "updatePreferences", token, body);
  }
  start(code, token) {
    return this.change(code, "start", token);
  }
  vote(code, token, body) {
    return this.change(code, "vote", token, body);
  }
  reset(code, token) {
    return this.change(code, "reset", token);
  }
  remove(code, token, memberId) {
    return this.change(code, "remove", token, memberId);
  }
}
module.exports = { PostgresRoomService };
