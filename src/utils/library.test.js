import {
  HISTORY_LIMIT,
  libraryReducer,
  normalizeTitle,
  parseTitles,
  titleKey,
} from "./library";
import { titlePath, validTitle } from "./titleUrls";

const movie = {
  id: 42,
  media_type: "movie",
  title: "A movie",
  poster_path: "/poster.jpg",
  release_date: "2024-01-01",
  vote_average: 8,
};
const tv = { ...movie, media_type: "tv", title: "A series" };
const empty = () => ({ watchlist: [], recentlyViewed: [] });

test("movies and series with the same TMDB ID remain distinct saved titles", () => {
  let state = libraryReducer(empty(), {
    type: "SAVE",
    item: movie,
    saved: true,
    timestamp: 1,
  });
  state = libraryReducer(state, {
    type: "SAVE",
    item: tv,
    saved: true,
    timestamp: 2,
  });
  expect(state.watchlist.map(titleKey)).toEqual(["tv:42", "movie:42"]);
  state = libraryReducer(state, { type: "SAVE", item: movie, saved: false });
  expect(state.watchlist.map(titleKey)).toEqual(["tv:42"]);
});

test("saving an existing title updates its snapshot without duplicating it", () => {
  let state = libraryReducer(empty(), {
    type: "SAVE",
    item: movie,
    saved: true,
    timestamp: 1,
  });
  state = libraryReducer(state, {
    type: "SAVE",
    item: { ...movie, title: "Updated title" },
    saved: true,
    timestamp: 2,
  });
  expect(state.watchlist).toHaveLength(1);
  expect(state.watchlist[0].title).toBe("Updated title");
});

test("history keeps 30 unique titles and moves revisited titles to the front", () => {
  let state = empty();
  for (let id = 1; id <= HISTORY_LIMIT + 2; id++)
    state = libraryReducer(state, {
      type: "VIEW",
      item: { ...movie, id },
      timestamp: id,
    });
  expect(state.recentlyViewed).toHaveLength(HISTORY_LIMIT);
  expect(state.recentlyViewed[0].id).toBe(32);
  state = libraryReducer(state, {
    type: "VIEW",
    item: { ...movie, id: 10 },
    timestamp: 100,
  });
  expect(state.recentlyViewed[0].id).toBe(10);
  expect(state.recentlyViewed.filter((item) => item.id === 10)).toHaveLength(1);
});

test("removing from the watchlist does not delete viewing history", () => {
  let state = libraryReducer(empty(), {
    type: "VIEW",
    item: movie,
    timestamp: 1,
  });
  state = libraryReducer(state, {
    type: "SAVE",
    item: movie,
    saved: true,
    timestamp: 2,
  });
  state = libraryReducer(state, { type: "SAVE", item: movie, saved: false });
  expect(state.watchlist).toHaveLength(0);
  expect(state.recentlyViewed).toHaveLength(1);
});

test("undoing a history clear preserves titles viewed after the clear", () => {
  let state = libraryReducer(empty(), {
    type: "VIEW",
    item: movie,
    timestamp: 1,
  });
  const previous = state.recentlyViewed;
  state = libraryReducer(state, { type: "CLEAR_HISTORY" });
  state = libraryReducer(state, { type: "VIEW", item: tv, timestamp: 2 });
  state = libraryReducer(state, { type: "RESTORE_HISTORY", items: previous });
  expect(state.recentlyViewed.map(titleKey)).toEqual(["tv:42", "movie:42"]);
});

test("malformed storage is ignored and stored titles are normalized and deduplicated", () => {
  expect(parseTitles("broken json")).toEqual([]);
  expect(parseTitles('{"not":"an array"}')).toEqual([]);
  expect(
    parseTitles(
      JSON.stringify([
        null,
        movie,
        movie,
        { id: -2, title: "Invalid", media_type: "movie" },
      ]),
    ),
  ).toHaveLength(1);
  expect(
    normalizeTitle({
      id: "5",
      type: "tv",
      name: "A show",
      first_air_date: "2020-01-01",
      vote_average: 99,
    }),
  ).toMatchObject({
    id: 5,
    media_type: "tv",
    title: "A show",
    release_date: "2020-01-01",
    vote_average: 10,
  });
});

test("title URLs distinguish media types and reject invalid IDs and routes", () => {
  expect(titlePath("movie", 42)).toBe("/title/movie/42");
  expect(titlePath("tv", 42)).toBe("/title/tv/42");
  expect(validTitle("movie", "42")).toBe(true);
  for (const id of ["0", "-1", "abc", "1.5", "9007199254740992"])
    expect(validTitle("movie", id)).toBe(false);
  expect(validTitle("person", "42")).toBe(false);
});
