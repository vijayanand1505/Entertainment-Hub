import { normalizeTitle } from "./library";
import { MOODS } from "./picks";

export const PICK_SESSION_KEY = "eh-pick-session-v1";
export const INITIAL_PICK_FILTERS = {
  type: "movie",
  mood: "any",
  genre: "",
  language: "",
  minutes: "",
};

function normalizeFilters(value) {
  return {
    type: value?.type === "tv" ? "tv" : "movie",
    mood: MOODS.some((mood) => mood.value === value?.mood)
      ? value.mood
      : "any",
    genre: /^\d+$/.test(value?.genre) ? String(value.genre) : "",
    language: /^[a-z]{2}$/.test(value?.language) ? value.language : "",
    minutes: ["30", "45", "60", "90", "120", "180"].includes(value?.minutes)
      ? value.minutes
      : "",
  };
}

export function readPickSession() {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(PICK_SESSION_KEY));
  } catch {
    // Picking remains available when browser storage is unavailable.
  }
  const title = normalizeTitle(saved?.item);
  return {
    preferences: normalizeFilters(saved?.preferences),
    item: title
      ? {
          ...title,
          overview:
            typeof saved.item.overview === "string" ? saved.item.overview : "",
          backdrop_path:
            typeof saved.item.backdrop_path === "string" &&
            saved.item.backdrop_path.startsWith("/")
              ? saved.item.backdrop_path
              : null,
          pick_runtime: Number.isFinite(saved.item.pick_runtime)
            ? saved.item.pick_runtime
            : 0,
        }
      : null,
    filters: title ? normalizeFilters(saved.filters) : null,
    genreName: typeof saved?.genreName === "string" ? saved.genreName : "",
    query: typeof saved?.query === "string" ? saved.query : "",
    seen: Array.isArray(saved?.seen)
      ? saved.seen.filter((key) => typeof key === "string")
      : [],
  };
}
