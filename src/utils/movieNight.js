const SESSION_KEY = "eh-movie-night-sessions-v1";
const memory = new Map();
export const MOVIE_GENRES = [
  [28, "Action"],
  [12, "Adventure"],
  [16, "Animation"],
  [35, "Comedy"],
  [80, "Crime"],
  [99, "Documentary"],
  [18, "Drama"],
  [10751, "Family"],
  [14, "Fantasy"],
  [36, "History"],
  [27, "Horror"],
  [10402, "Music"],
  [9648, "Mystery"],
  [10749, "Romance"],
  [878, "Science Fiction"],
  [53, "Thriller"],
  [10752, "War"],
  [37, "Western"],
];
export const EMPTY_PREFERENCES = { genres: [], languages: [], minutes: "" };
function sessions() {
  try {
    const data = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}
export function roomSession(code) {
  const value = memory.get(code) || sessions()[code];
  return value &&
    typeof value.token === "string" &&
    value.expiresAt > Date.now()
    ? value
    : null;
}
export function rememberRoom(room, token) {
  const value = { token, name: room.name, expiresAt: room.expiresAt };
  memory.set(room.code, value);
  try {
    const stored = sessions();
    stored[room.code] = value;
    const retained = Object.fromEntries(
      Object.entries(stored)
        .filter(([, entry]) => entry?.expiresAt > Date.now())
        .slice(-20),
    );
    localStorage.setItem(SESSION_KEY, JSON.stringify(retained));
    return true;
  } catch {
    return false;
  }
}
export function forgetRoom(code) {
  memory.delete(code);
  try {
    const stored = sessions();
    delete stored[code];
    localStorage.setItem(SESSION_KEY, JSON.stringify(stored));
  } catch {}
}
export function recentRooms() {
  return Object.entries({ ...sessions(), ...Object.fromEntries(memory) })
    .filter(
      ([, entry]) =>
        typeof entry?.name === "string" && entry.expiresAt > Date.now(),
    )
    .slice(-3)
    .reverse()
    .map(([code, entry]) => ({ code, name: entry.name }));
}
export async function nightRequest(
  path,
  { token, method = "GET", data, signal } = {},
) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort);
  if (signal?.aborted) controller.abort();
  const timer = setTimeout(abort, path.endsWith("/start") ? 120000 : 15000);
  try {
    const response = await fetch("/api/movie-night" + path, {
      method,
      headers: {
        ...(token ? { Authorization: "Bearer " + token } : {}),
        ...(data !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: data === undefined ? undefined : JSON.stringify(data),
      signal: controller.signal,
      cache: "no-store",
    });
    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new Error(
        "Movie Night rooms are offline. Start the app with npm start, then try again.",
      );
    }
    if (!response.ok) {
      const error = new Error(
        payload.error || "The room couldn’t be updated. Please try again.",
      );
      error.status = response.status;
      throw error;
    }
    return payload;
  } catch (error) {
    if (error.name === "AbortError" && !signal?.aborted)
      throw new Error(
        "The room is taking longer to respond. Check the connection and try again.",
      );
    if (error instanceof TypeError)
      throw new Error(
        "We couldn’t connect to this movie night. Check your connection and try again.",
      );
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}
export async function copyNightLink(value) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const previous = document.activeElement;
    const field = document.createElement("textarea");
    field.value = value;
    field.style.position = "fixed";
    field.style.left = "-9999px";
    document.body.appendChild(field);
    field.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {}
    field.remove();
    previous?.focus({ preventScroll: true });
    return copied;
  }
}
