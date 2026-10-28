import { normalizeTitle, titleKey } from "./library";

export const PERSONALIZATION_KEY = "eh-personalization-v1";
export const FEEDBACK_KINDS = ["watched", "liked", "hidden"];
export const FALLBACK_REGIONS = [
  { iso_3166_1: "IN", english_name: "India" },
  { iso_3166_1: "US", english_name: "United States" },
  { iso_3166_1: "GB", english_name: "United Kingdom" },
  { iso_3166_1: "CA", english_name: "Canada" },
  { iso_3166_1: "AU", english_name: "Australia" },
];
export const providerIds = (values) =>
  [
    ...new Set(
      (Array.isArray(values) ? values : [])
        .map(Number)
        .filter((id) => Number.isSafeInteger(id) && id > 0),
    ),
  ].slice(0, 50);
export function normalizeProvider(value) {
  const id = Number(value?.id ?? value?.provider_id);
  const name = value?.name ?? value?.provider_name;
  if (
    !Number.isSafeInteger(id) ||
    id <= 0 ||
    typeof name !== "string" ||
    !name.trim()
  )
    return null;
  const logo = value.logo ?? value.logo_path;
  return {
    id,
    name: name.trim().slice(0, 100),
    logo:
      typeof logo === "string" && logo.startsWith("/")
        ? logo.slice(0, 300)
        : null,
  };
}
export function normalizePersonalization(value) {
  const region = /^[A-Z]{2}$/.test(value?.region || "") ? value.region : "IN";
  const services = {};
  Object.entries(
    value?.services && typeof value.services === "object" ? value.services : {},
  )
    .slice(0, 60)
    .forEach(([country, list]) => {
      if (!/^[A-Z]{2}$/.test(country) || !Array.isArray(list)) return;
      const seen = new Set();
      services[country] = list
        .map(normalizeProvider)
        .filter((p) => {
          if (!p || seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        })
        .slice(0, 50);
    });
  const seen = new Set();
  const feedback = (Array.isArray(value?.feedback) ? value.feedback : [])
    .map((entry) => {
      const item = normalizeTitle(entry);
      if (!item || seen.has(titleKey(item))) return null;
      seen.add(titleKey(item));
      const hidden = entry.hidden === true;
      return {
        ...item,
        watched: entry.watched === true,
        liked: !hidden && entry.liked === true,
        hidden,
        updatedAt: Number.isFinite(entry.updatedAt) ? entry.updatedAt : 0,
      };
    })
    .filter((entry) => entry && FEEDBACK_KINDS.some((kind) => entry[kind]))
    .slice(0, 5000);
  return {
    region,
    services,
    onlyMyServices: value?.onlyMyServices === true,
    feedback,
  };
}
export function parsePersonalization(raw) {
  try {
    return normalizePersonalization(JSON.parse(raw || "{}"));
  } catch {
    return normalizePersonalization(null);
  }
}
export function setTitleFeedback(entries, value, kind, enabled) {
  const item = normalizeTitle(value);
  if (!item || !FEEDBACK_KINDS.includes(kind)) return entries;
  const existing = entries.find((entry) => titleKey(entry) === titleKey(item));
  const next = {
    ...item,
    watched: false,
    liked: false,
    hidden: false,
    ...existing,
    [kind]: enabled,
    updatedAt: Date.now(),
  };
  if (kind === "liked" && enabled) next.hidden = false;
  if (kind === "hidden" && enabled) next.liked = false;
  const rest = entries.filter((entry) => titleKey(entry) !== titleKey(item));
  return FEEDBACK_KINDS.some((field) => next[field])
    ? [next, ...rest].slice(0, 5000)
    : rest;
}
export function activeStreaming(state) {
  const ids = providerIds(
    (state.services[state.region] || []).map((p) => p.id),
  );
  return state.onlyMyServices && ids.length
    ? { region: state.region, providers: ids }
    : null;
}
export function applyStreamingParams(params, streaming) {
  const ids = providerIds(streaming?.providers);
  if (ids.length && /^[A-Z]{2}$/.test(streaming?.region || "")) {
    params.set("watch_region", streaming.region);
    params.set("with_watch_providers", ids.join("|"));
    params.set("with_watch_monetization_types", "flatrate");
  }
}
export function availableOnServices(data, streaming) {
  if (!streaming) return true;
  return (data?.results?.[streaming.region]?.flatrate || []).some((p) =>
    streaming.providers.includes(p.provider_id),
  );
}
export function isExcluded(item, feedback, skipWatched = true) {
  const entry = feedback.find((entry) => titleKey(entry) === titleKey(item));
  return Boolean(entry?.hidden || (skipWatched && entry?.watched));
}
