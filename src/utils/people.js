import { validTmdbId } from "./titleUrls";
export const personPath = (id) => `/person/${id}`;
export const validPersonId = validTmdbId;

export function personCredits(cast = []) {
  const unique = new Map();
  if (!Array.isArray(cast)) return [];
  cast.forEach((item) => {
    if (
      !validTmdbId(item?.id) ||
      !["movie", "tv"].includes(item?.media_type) ||
      item.adult === true
    )
      return;
    const title = item.title || item.name;
    if (typeof title !== "string" || !title.trim()) return;
    const key = `${item.media_type}:${item.id}`;
    const previous = unique.get(key);
    const role =
      typeof item.character === "string" ? item.character.trim() : "";
    unique.set(key, {
      ...item,
      id: Number(item.id),
      title,
      release_date: item.release_date || item.first_air_date || "",
      roles: [
        ...new Set([...(previous?.roles || []), ...(role ? [role] : [])]),
      ],
    });
  });
  return [...unique.values()];
}
export function sortCredits(credits, sort) {
  return [...credits].sort((a, b) =>
    sort === "newest"
      ? (b.release_date || "").localeCompare(a.release_date || "") ||
        (b.popularity || 0) - (a.popularity || 0)
      : (b.popularity || 0) - (a.popularity || 0) ||
        (b.vote_count || 0) - (a.vote_count || 0),
  );
}
export function formatPersonDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return "";
  const date = new Date(value + "T00:00:00");
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
}
