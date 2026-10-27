export const titlePath = (type, id) => `/title/${type}/${id}`;
export const validTmdbId = (id) =>
  /^[1-9]\d*$/.test(String(id)) && Number.isSafeInteger(Number(id));
export const validTitle = (type, id) =>
  ["movie", "tv"].includes(type) && validTmdbId(id);
