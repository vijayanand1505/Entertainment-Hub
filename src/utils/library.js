export const WATCHLIST_KEY = "eh-watchlist-v1";
export const HISTORY_KEY = "eh-viewing-history-v1";
export const HISTORY_LIMIT = 30;
export const titleKey = (item) => `${item.media_type}:${item.id}`;

export function normalizeTitle(value) {
  if (!value || typeof value !== "object") return null;
  const id = Number(value.id);
  const media_type = value.media_type || value.type;
  const title = value.title || value.name;
  if (
    !Number.isSafeInteger(id) ||
    id <= 0 ||
    !["movie", "tv"].includes(media_type) ||
    typeof title !== "string" ||
    !title.trim()
  )
    return null;
  const poster = value.poster_path || value.poster;
  const date = value.release_date || value.first_air_date || value.date;
  return {
    id,
    media_type,
    title: title.trim().slice(0, 300),
    poster_path:
      typeof poster === "string" && poster.startsWith("/")
        ? poster.slice(0, 300)
        : null,
    release_date: typeof date === "string" ? date.slice(0, 10) : "",
    vote_average: Number.isFinite(Number(value.vote_average))
      ? Math.max(0, Math.min(10, Number(value.vote_average)))
      : 0,
    savedAt: Number.isFinite(value.savedAt) ? value.savedAt : 0,
    viewedAt: Number.isFinite(value.viewedAt) ? value.viewedAt : 0,
  };
}
export function parseTitles(raw, limit = 1000) {
  try {
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    const seen = new Set();
    return parsed
      .map(normalizeTitle)
      .filter((item) => {
        if (!item || seen.has(titleKey(item))) return false;
        seen.add(titleKey(item));
        return true;
      })
      .slice(0, limit);
  } catch {
    return [];
  }
}
export function libraryReducer(state, action) {
  const item = normalizeTitle(action.item);
  switch (action.type) {
    case "SAVE": {
      if (!item) return state;
      const others = state.watchlist.filter(
        (entry) => titleKey(entry) !== titleKey(item),
      );
      return {
        ...state,
        watchlist: action.saved
          ? [
              {
                ...item,
                savedAt: action.timestamp || item.savedAt || Date.now(),
              },
              ...others,
            ].sort((a, b) => b.savedAt - a.savedAt)
          : others,
      };
    }
    case "VIEW":
      if (!item) return state;
      return {
        ...state,
        recentlyViewed: [
          { ...item, viewedAt: action.timestamp || Date.now() },
          ...state.recentlyViewed.filter(
            (entry) => titleKey(entry) !== titleKey(item),
          ),
        ].slice(0, HISTORY_LIMIT),
      };
    case "CLEAR_HISTORY":
      return { ...state, recentlyViewed: [] };
    case "RESTORE_HISTORY": {
      const merged = [...state.recentlyViewed, ...action.items].sort(
        (a, b) => b.viewedAt - a.viewedAt,
      );
      return {
        ...state,
        recentlyViewed: parseTitles(JSON.stringify(merged), HISTORY_LIMIT),
      };
    }
    default:
      return state;
  }
}
