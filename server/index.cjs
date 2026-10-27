const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { RoomStore, RoomService } = require("./rooms.cjs");
const { createCatalog } = require("./catalog.cjs");
const { createRoomServer } = require("./http.cjs");
const production = process.argv.includes("--serve-build");
const port = Number(
  process.env.ROOMS_PORT || (production ? process.env.PORT : null) || 4000,
);
const hostname = production ? process.env.ROOMS_HOST || "0.0.0.0" : "127.0.0.1";
try {
  const store = new RoomStore(
    process.env.ROOMS_DATA_FILE ||
      path.join(__dirname, "../.data/movie-night-rooms.json"),
  );
  const service = new RoomService(
    store,
    createCatalog(process.env.REACT_APP_API_KEY),
  );
  const server = createRoomServer(service, {
    frontendPort: production ? port : Number(process.env.PORT || 3001),
    publicOrigin: process.env.PUBLIC_APP_URL || "",
    buildDir: production ? path.join(__dirname, "../build") : null,
  });
  server.listen(port, hostname, () =>
    console.log(`Movie Night rooms ready at http://${hostname}:${port}`),
  );
  server.on("error", (error) => {
    console.error(
      error.code === "EADDRINUSE"
        ? `Room service port ${port} is already in use.`
        : "The room service could not start.",
    );
    process.exitCode = 1;
  });
  const close = () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 2000).unref();
  };
  process.on("SIGTERM", close);
  process.on("SIGINT", close);
} catch {
  console.error(
    "The room service could not read its saved data. Check the room data file before restarting.",
  );
  process.exitCode = 1;
}
