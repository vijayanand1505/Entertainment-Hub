const axios = require("axios");
const { RoomError } = require("./rooms.cjs");

function normalizeMovie(data, members, shared, today) {
  if (
    !data ||
    !Number.isSafeInteger(data.id) ||
    data.id <= 0 ||
    typeof data.title !== "string" ||
    !data.title.trim() ||
    data.adult ||
    !data.release_date ||
    data.release_date > today
  )
    return null;
  if (
    shared.minutes &&
    (!Number.isFinite(data.runtime) ||
      data.runtime <= 0 ||
      data.runtime > shared.minutes)
  )
    return null;
  if (
    shared.languages.length &&
    !shared.languages.includes(data.original_language)
  )
    return null;
  const genres = (data.genres || [])
    .filter(
      (entry) =>
        Number.isSafeInteger(entry.id) && typeof entry.name === "string",
    )
    .map(({ id, name }) => ({ id, name: name.slice(0, 60) }));
  return {
    id: data.id,
    media_type: "movie",
    title: data.title.slice(0, 300),
    overview: String(data.overview || "").slice(0, 2000),
    release_date: String(data.release_date).slice(0, 10),
    poster_path:
      typeof data.poster_path === "string" && data.poster_path.startsWith("/")
        ? data.poster_path
        : null,
    backdrop_path:
      typeof data.backdrop_path === "string" &&
      data.backdrop_path.startsWith("/")
        ? data.backdrop_path
        : null,
    runtime: data.runtime || 0,
    original_language: data.original_language || "",
    vote_average: Number.isFinite(data.vote_average) ? data.vote_average : 0,
    genres,
    genreMatches: members.filter(
      (entry) =>
        entry.preferences.genres.length > 0 &&
        entry.preferences.genres.some((id) =>
          genres.some((genre) => genre.id === id),
        ),
    ).length,
  };
}
function createCatalog(apiKey, transport = axios) {
  const cache = new Map();
  const request = async (endpoint, params = {}) => {
    if (!apiKey)
      throw new RoomError(
        503,
        "Movie data isn’t configured. Add the TMDB key to .env.local and restart the app.",
      );
    try {
      return (
        await transport.get(`https://api.themoviedb.org/3/${endpoint}`, {
          params: { ...params, api_key: apiKey, language: "en-US" },
          timeout: 12000,
        })
      ).data;
    } catch (error) {
      if (error.response?.status === 404) return null;
      throw new RoomError(
        502,
        "We couldn’t reach the movie catalog. Please try starting the round again.",
      );
    }
  };
  return async (room) => {
    const today = new Date().toISOString().slice(0, 10);
    let ids;
    if (room.source) ids = room.source.ids;
    else {
      const params = {
        include_adult: false,
        sort_by: "popularity.desc",
        "vote_count.gte": 30,
        "primary_release_date.lte": today,
      };
      if (room.shared.minutes) {
        params["with_runtime.gte"] = 1;
        params["with_runtime.lte"] = room.shared.minutes;
      }
      if (room.shared.genres.length)
        params.with_genres = room.shared.genres.join("|");
      if (room.streaming) {
        params.watch_region = room.streaming.region;
        params.with_watch_providers = room.streaming.providers.join("|");
        params.with_watch_monetization_types = "flatrate";
      }
      const languages = room.shared.languages.length
        ? room.shared.languages
        : [""];
      const responses = await Promise.all(
        languages.slice(0, 4).map((code) =>
          request("discover/movie", {
            ...params,
            ...(code ? { with_original_language: code } : {}),
          }),
        ),
      );
      ids = [
        ...new Set(
          responses.flatMap((data) =>
            (data?.results || []).map((item) => item.id),
          ),
        ),
      ].slice(0, 40);
    }
    const movies = [];
    // Small batches keep the catalog responsive without sending a request for every poster at once.
    for (
      let offset = 0;
      offset < ids.length && movies.length < 18;
      offset += 4
    ) {
      const batch = await Promise.all(
        ids.slice(offset, offset + 4).map(async (id) => {
          let data = cache.get(id);
          if (!data || data.expires < Date.now()) {
            const movie = await request(`movie/${id}`);
            data = { movie, expires: Date.now() + 10 * 60 * 1000 };
            if (cache.size > 500) cache.clear();
            cache.set(id, data);
          }
          const movie = normalizeMovie(
            data.movie,
            room.members,
            room.shared,
            today,
          );
          if (!movie || !room.streaming) return movie;
          const availability = await request(`movie/${id}/watch/providers`);
          const included =
            availability?.results?.[room.streaming.region]?.flatrate || [];
          return included.some((provider) =>
            room.streaming.providers.includes(provider.provider_id),
          )
            ? movie
            : null;
        }),
      );
      movies.push(...batch.filter(Boolean));
    }
    return movies
      .sort(
        (a, b) =>
          b.genreMatches - a.genreMatches || b.vote_average - a.vote_average,
      )
      .slice(0, 12);
  };
}
module.exports = { createCatalog, normalizeMovie };
