import { normalizeTitle, titleKey } from "./library";
export const MOODS = [
  { value: "any", label: "Surprise me", symbol: "✦", genres: [] },
  { value: "light", label: "Make me smile", symbol: "☀", genres: ["Comedy"] },
  {
    value: "adventure",
    label: "An adventure",
    symbol: "↗",
    genres: ["Adventure", "Action", "Action & Adventure"],
  },
  {
    value: "suspense",
    label: "Keep me guessing",
    symbol: "?",
    genres: ["Mystery", "Thriller", "Crime"],
  },
  {
    value: "moving",
    label: "Something moving",
    symbol: "♡",
    genres: ["Drama", "Romance"],
  },
  {
    value: "escape",
    label: "Another world",
    symbol: "☾",
    genres: ["Science Fiction", "Fantasy", "Sci-Fi & Fantasy"],
  },
];
export function pickRuntime(details, type) {
  const values =
    type === "tv"
      ? [
          ...(details.episode_run_time || []),
          details.last_episode_to_air?.runtime,
        ]
      : [details.runtime];
  return Math.max(
    0,
    ...values.filter((value) => Number.isFinite(value) && value > 0),
  );
}
export function buildPickPath(
  filters,
  genres,
  page = 1,
  today = new Date().toISOString().slice(0, 10),
) {
  const type = filters.type === "tv" ? "tv" : "movie";
  const params = new URLSearchParams({
    include_adult: "false",
    sort_by: "popularity.desc",
    "vote_count.gte": "50",
    "with_runtime.gte": "1",
    page: String(page),
  });
  params.set(
    type === "movie" ? "primary_release_date.lte" : "first_air_date.lte",
    today,
  );
  if (filters.language) params.set("with_original_language", filters.language);
  if (filters.minutes) params.set("with_runtime.lte", filters.minutes);
  if (filters.genre) params.set("with_genres", filters.genre);
  else {
    const mood = MOODS.find((entry) => entry.value === filters.mood);
    const ids = genres
      .filter((entry) => mood?.genres.includes(entry.name))
      .map((entry) => entry.id);
    if (ids.length) params.set("with_genres", ids.join("|"));
  }
  return `discover/${type}?${params}`;
}
export function choosePick(
  results,
  type,
  excluded = new Set(),
  random = Math.random,
) {
  const seen = new Set();
  const eligible = (results || []).filter((entry) => {
    const title = normalizeTitle({ ...entry, media_type: type });
    if (entry.adult || !title) return false;
    const key = titleKey(title);
    if (excluded.has(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return eligible.length
    ? {
        ...eligible[
          Math.min(eligible.length - 1, Math.floor(random() * eligible.length))
        ],
        media_type: type,
      }
    : null;
}
