const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { RoomError } = require("./rooms.cjs");
const PREFIX = "/api/movie-night";
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".txt": "text/plain",
  ".woff2": "font/woff2",
  ".map": "application/json",
};
function send(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "same-origin",
  });
  res.end(JSON.stringify(data));
}
async function readBody(req) {
  if (!String(req.headers["content-type"] || "").startsWith("application/json"))
    throw new RoomError(415, "Please send JSON data.");
  let body;
  if (req.body !== undefined) {
    body = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body);
  } else {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size <= 16 * 1024) chunks.push(chunk);
    }
    if (size > 16 * 1024) throw new RoomError(413, "This request is too large.");
    body = Buffer.concat(chunks).toString("utf8");
  }
  if (Buffer.byteLength(body) > 16 * 1024)
    throw new RoomError(413, "This request is too large.");
  try {
    const parsed = JSON.parse(body || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      throw new Error();
    return parsed;
  } catch {
    throw new RoomError(
      400,
      "This request couldn’t be read. Please try again.",
    );
  }
}
function networkOrigin(port) {
  const addresses = Object.values(os.networkInterfaces())
    .flat()
    .filter(
      (entry) =>
        entry &&
        entry.family === "IPv4" &&
        !entry.internal &&
        /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(entry.address),
    );
  addresses.sort(
    (a, b) =>
      Number(b.address.startsWith("192.168.")) -
      Number(a.address.startsWith("192.168.")),
  );
  return addresses[0] ? `http://${addresses[0].address}:${port}` : "";
}
function createRoomHandler(service, options = {}) {
  const buckets = new Map();
  const limit = (req, kind, maximum) => {
    const now = Date.now();
    for (const [key, entry] of buckets)
      if (entry.until < now) buckets.delete(key);
    const key = `${req.socket.remoteAddress}:${kind}`;
    const current = buckets.get(key) || { count: 0, until: now + 60000 };
    current.count++;
    buckets.set(key, current);
    if (current.count > maximum)
      throw new RoomError(
        429,
        "A little too fast. Please wait a minute and try again.",
      );
  };
  return async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      const pathname = url.pathname;
      if (pathname.startsWith(PREFIX)) {
        limit(req, "all", 600);
        const rawToken = req.headers.authorization;
        const token = rawToken?.startsWith("Bearer ")
          ? rawToken.slice(7)
          : null;
        if (req.method === "GET" && pathname === PREFIX + "/health")
          return send(res, 200, { ok: true });
        if (req.method === "GET" && pathname === PREFIX + "/config")
          return send(res, 200, {
            shareOrigin:
              options.publicOrigin ||
              networkOrigin(options.frontendPort || 3001),
          });
        if (req.method === "POST" && pathname === PREFIX + "/rooms") {
          limit(req, "create", 12);
          return send(res, 201, await service.create(await readBody(req)));
        }
        const match = pathname.match(
          /^\/api\/movie-night\/rooms\/([a-f0-9]{10})(?:\/(join|preferences|start|votes|reset|members)(?:\/([a-f0-9]{16}))?)?$/,
        );
        if (!match) throw new RoomError(404, "This room action wasn’t found.");
        const [, code, action, memberId] = match;
        if (req.method === "GET" && !action)
          return send(res, 200, await service.get(code, token));
        if (req.method === "POST" && action === "join") {
          limit(req, "join", 30);
          return send(res, 201, await service.join(code, await readBody(req)));
        }
        if (!token)
          throw new RoomError(401, "Join this room before taking part.");
        if (req.method === "PUT" && action === "preferences")
          return send(
            res,
            200,
            await service.updatePreferences(code, token, await readBody(req)),
          );
        if (req.method === "POST" && action === "start") {
          await readBody(req);
          return send(res, 200, await service.start(code, token));
        }
        if (req.method === "PUT" && action === "votes")
          return send(res, 200, await service.vote(code, token, await readBody(req)));
        if (req.method === "POST" && action === "reset") {
          await readBody(req);
          return send(res, 200, await service.reset(code, token));
        }
        if (req.method === "DELETE" && action === "members" && memberId)
          return send(res, 200, await service.remove(code, token, memberId));
        throw new RoomError(405, "This room action isn’t supported.");
      }
      if (!options.buildDir || !["GET", "HEAD"].includes(req.method))
        return send(res, 404, { error: "Not found" });
      let decoded;
      try {
        decoded = decodeURIComponent(pathname);
      } catch {
        return send(res, 400, { error: "Invalid path" });
      }
      let filename = path.resolve(options.buildDir, "." + decoded);
      if (
        !filename.startsWith(path.resolve(options.buildDir) + path.sep) &&
        filename !== path.resolve(options.buildDir)
      )
        return send(res, 404, { error: "Not found" });
      if (!fs.existsSync(filename) || fs.statSync(filename).isDirectory()) {
        if (path.extname(decoded))
          return send(res, 404, { error: "Not found" });
        filename = path.join(options.buildDir, "index.html");
      }
      if (!fs.existsSync(filename))
        return send(res, 503, {
          error: "Run npm run build before serving the production app.",
        });
      res.writeHead(200, {
        "Content-Type":
          MIME[path.extname(filename)] || "application/octet-stream",
        "Cache-Control": filename.endsWith("index.html")
          ? "no-cache"
          : "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      });
      if (req.method === "HEAD") return res.end();
      const stream = fs.createReadStream(filename);
      stream.on("error", () => res.destroy());
      stream.pipe(res);
    } catch (error) {
      if (!res.headersSent)
        send(res, error.status || 500, {
          error:
            error instanceof RoomError
              ? error.message
              : "The room couldn’t be updated. Please try again.",
        });
      else res.destroy();
    }
  };
}
function createRoomServer(service, options = {}) {
  return http.createServer(createRoomHandler(service, options));
}
module.exports = { createRoomHandler, createRoomServer, networkOrigin };
