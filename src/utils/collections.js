import { normalizeTitle, parseTitles, titleKey } from "./library";

export const COLLECTIONS_KEY = "eh-collections-v1";
export const COLLECTION_COLORS = {
  ember: "#e17c56",
  violet: "#a18be0",
  ocean: "#65a6cd",
  forest: "#78aa88",
  rose: "#d68caa",
};
export const cleanName = (name) =>
  String(name || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 60);
export function parseCollections(raw) {
  try {
    const entries = JSON.parse(raw || "[]");
    if (!Array.isArray(entries)) return [];
    const ids = new Set();
    return entries
      .filter((entry) => {
        if (
          !entry ||
          typeof entry.id !== "string" ||
          !/^[\w-]{1,100}$/.test(entry.id) ||
          typeof entry.name !== "string" ||
          !cleanName(entry.name) ||
          ids.has(entry.id)
        )
          return false;
        ids.add(entry.id);
        return true;
      })
      .slice(0, 100)
      .map((entry) => ({
        id: entry.id,
        name: cleanName(entry.name),
        description:
          typeof entry.description === "string"
            ? entry.description.trim().slice(0, 200)
            : "",
        color: COLLECTION_COLORS[entry.color] ? entry.color : "ember",
        items: parseTitles(JSON.stringify(entry.items || [])),
        createdAt: Number.isFinite(entry.createdAt) ? entry.createdAt : 0,
        updatedAt: Number.isFinite(entry.updatedAt) ? entry.updatedAt : 0,
      }));
  } catch {
    return [];
  }
}
export function collectionError(collections, draft, id) {
  const name = cleanName(draft.name);
  if (!name) return "Give your collection a name.";
  if (
    collections.some(
      (entry) =>
        entry.id !== id &&
        entry.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
    )
  )
    return "A collection with that name already exists.";
  if (!id && collections.length >= 100)
    return "You’ve reached 100 collections. Remove one to create another.";
  return "";
}
export function collectionsReducer(state, action) {
  switch (action.type) {
    case "UPSERT": {
      const existing = state.find((entry) => entry.id === action.id);
      if (collectionError(state, action.draft, existing?.id)) return state;
      const next = {
        id: action.id,
        name: cleanName(action.draft.name),
        description: String(action.draft.description || "")
          .trim()
          .slice(0, 200),
        color: COLLECTION_COLORS[action.draft.color]
          ? action.draft.color
          : "ember",
        items: existing?.items || [],
        createdAt: existing?.createdAt || action.timestamp,
        updatedAt: action.timestamp,
      };
      return existing
        ? state.map((entry) => (entry.id === action.id ? next : entry))
        : [next, ...state];
    }
    case "TOGGLE": {
      const item = normalizeTitle(action.item);
      if (!item) return state;
      return state.map((entry) => {
        if (entry.id !== action.id) return entry;
        const present = entry.items.some(
          (title) => titleKey(title) === titleKey(item),
        );
        if (!present && entry.items.length >= 1000) return entry;
        return {
          ...entry,
          updatedAt: action.timestamp,
          items: present
            ? entry.items.filter((title) => titleKey(title) !== titleKey(item))
            : [{ ...item, savedAt: action.timestamp }, ...entry.items],
        };
      });
    }
    case "DELETE":
      return state.filter((entry) => entry.id !== action.id);
    case "RESTORE":
      return state.some((entry) => entry.id === action.entry.id)
        ? state
        : [action.entry, ...state];
    default:
      return state;
  }
}
