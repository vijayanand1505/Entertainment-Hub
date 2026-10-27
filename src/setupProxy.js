const http = require("http");

module.exports = function setupProxy(app) {
  app.use("/api/movie-night", (req, res) => {
    const upstream = http.request(
      {
        hostname: "127.0.0.1",
        port: Number(process.env.ROOMS_PORT || 4000),
        method: req.method,
        path: req.originalUrl,
        headers: req.headers,
      },
      (response) => {
        res.writeHead(response.statusCode, response.headers);
        response.pipe(res);
      },
    );
    upstream.on("error", () => {
      if (!res.headersSent) {
        res
          .status(503)
          .json({
            error:
              "Movie Night rooms are offline. Start the app with npm start to run the room service too.",
          });
      } else res.destroy();
    });
    req.on("aborted", () => upstream.destroy());
    res.on("close", () => {
      if (!res.writableEnded) upstream.destroy();
    });
    req.pipe(upstream);
  });
};
