const { Pool } = require("pg");
const { createCatalog } = require("../server/catalog.cjs");
const { createRoomHandler } = require("../server/http.cjs");
const { PostgresRoomService } = require("../server/postgres.cjs");

let service;
let handler;
module.exports = async (req, res) => {
  if (!process.env.DATABASE_URL) {
    res.writeHead(503, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    return res.end(JSON.stringify({ error: "Movie Night storage is not configured." }));
  }
  if (!service) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 10000,
    });
    pool.on("error", () => console.error("Movie Night database connection interrupted."));
    service = new PostgresRoomService(pool, createCatalog(process.env.REACT_APP_API_KEY));
    handler = createRoomHandler(service, { publicOrigin: process.env.PUBLIC_APP_URL });
  }
  try {
    await service.ready();
    const roomPath = req.query?.roomPath;
    if (roomPath !== undefined) {
      req.url = "/api/movie-night/" + (Array.isArray(roomPath) ? roomPath.join("/") : roomPath);
    }
    return await handler(req, res);
  } catch {
    res.writeHead(503, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    res.end(JSON.stringify({ error: "Movie Night is temporarily unavailable. Please try again." }));
  }
};
