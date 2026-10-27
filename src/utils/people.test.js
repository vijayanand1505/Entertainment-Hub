import {
  personCredits,
  sortCredits,
  validPersonId,
  formatPersonDate,
} from "./people";
import { playableVideos } from "./videos";

test("filmography deduplicates roles without merging movie and TV IDs", () => {
  const credits = personCredits([
    { id: 7, media_type: "movie", title: "Film", character: "Lead" },
    { id: 7, media_type: "movie", title: "Film", character: "Narrator" },
    { id: 7, media_type: "movie", title: "Film", character: "Lead" },
    {
      id: 7,
      media_type: "tv",
      name: "Show",
      character: "Guest",
      first_air_date: "2024-01-01",
    },
    { id: 8, media_type: "movie", title: "Excluded", adult: true },
    { id: -1, media_type: "movie", title: "Bad" },
    { id: 9, media_type: "person", title: "Not a title" },
  ]);
  expect(credits).toHaveLength(2);
  expect(credits[0].roles).toEqual(["Lead", "Narrator"]);
  expect(credits[1]).toMatchObject({
    title: "Show",
    release_date: "2024-01-01",
  });
  expect(personCredits(null)).toEqual([]);
});

test("filmography sorting keeps missing dates last and does not mutate source", () => {
  const credits = [
    { id: 1, popularity: 8, release_date: "" },
    { id: 2, popularity: 2, release_date: "2025-01-01" },
    { id: 3, popularity: 4, release_date: "2020-01-01" },
  ];
  expect(sortCredits(credits, "newest").map((item) => item.id)).toEqual([
    2, 3, 1,
  ]);
  expect(sortCredits(credits, "popular").map((item) => item.id)).toEqual([
    1, 3, 2,
  ]);
  expect(credits.map((item) => item.id)).toEqual([1, 2, 3]);
  expect(validPersonId("10297")).toBe(true);
  expect(validPersonId("../bad")).toBe(false);
  expect(formatPersonDate(null)).toBe("");
  expect(formatPersonDate("not a date")).toBe("");
});

test("video choices prioritize official trailers, deduplicate keys and exclude invalid sources", () => {
  const video = (key, type, official = false) => ({
    key,
    type,
    official,
    site: "YouTube",
  });
  const result = playableVideos([
    video("aaaaaaaaaaa", "Clip"),
    video("bbbbbbbbbbb", "Trailer"),
    video("ccccccccccc", "Teaser"),
    video("ddddddddddd", "Trailer", true),
    video("ddddddddddd", "Trailer", true),
    { ...video("eeeeeeeeeee", "Trailer"), site: "Vimeo" },
    video("unsafe/key", "Trailer"),
  ]);
  expect(result.map((item) => item.key)).toEqual([
    "ddddddddddd",
    "bbbbbbbbbbb",
    "ccccccccccc",
    "aaaaaaaaaaa",
  ]);
  expect(playableVideos(undefined)).toEqual([]);
});
