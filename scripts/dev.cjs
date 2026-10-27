const { spawn } = require("node:child_process");
const path = require("node:path");
const root = path.join(__dirname, "..");
const env = {
  ...process.env,
  PORT: process.env.PORT || "3001",
  HOST: process.env.HOST || "0.0.0.0",
};
const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  children.forEach((child) => child.kill("SIGTERM"));
  setTimeout(() => process.exit(code), 1500).unref();
}
function start(args) {
  const child = spawn(process.execPath, args, {
    cwd: root,
    env,
    stdio: "inherit",
  });
  children.push(child);
  child.on("error", () => stop(1));
  child.on("exit", (code) => stop(code || 0));
}
start([path.join(root, "server/index.cjs")]);
start([
  "--openssl-legacy-provider",
  "--require",
  path.join(root, "scripts/node-compat.cjs"),
  require.resolve("react-scripts/scripts/start.js"),
]);
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
