import { readDiscovery, discoverySearch, buildDiscoverPath } from "./discovery";

const apiParams = (type, search) =>
  new URLSearchParams(
    buildDiscoverPath(type, readDiscovery(search, type)).split("?")[1],
  );

test("TV filters use premiere year and episode duration rather than movie fields", () => {
  const params = apiParams(
    "tv",
    "?year=2025&runtime=short&language=ta&rating=8&genres=18,80&page=2",
  );
  expect(params.get("first_air_date_year")).toBe("2025");
  expect(params.has("primary_release_year")).toBe(false);
  expect(params.get("with_runtime.gte")).toBe("1");
  expect(params.get("with_runtime.lte")).toBe("29");
  expect(params.get("with_original_language")).toBe("ta");
  expect(params.get("vote_average.gte")).toBe("8");
  expect(params.get("vote_count.gte")).toBe("100");
  expect(params.get("with_genres")).toBe("18,80");
  expect(params.get("page")).toBe("2");
});

test("long movies have an open upper duration bound and use release year", () => {
  const params = apiParams("movie", "?year=2024&runtime=epic");
  expect(params.get("primary_release_year")).toBe("2024");
  expect(params.get("with_runtime.gte")).toBe("181");
  expect(params.has("with_runtime.lte")).toBe(false);
  expect(params.has("vote_count.gte")).toBe(false);
});

test("rating sort avoids single-vote titles and newest sort excludes future releases", () => {
  const rated = apiParams("movie", "?sort=rating");
  expect(rated.get("sort_by")).toBe("vote_average.desc");
  expect(rated.get("vote_count.gte")).toBe("100");
  const newest = apiParams("tv", "?sort=newest");
  expect(newest.get("sort_by")).toBe("first_air_date.desc");
  expect(newest.get("first_air_date.lte")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(newest.has("primary_release_date.lte")).toBe(false);
});

test("shared filters round trip without losing genres, sorting, or pagination", () => {
  const filters = readDiscovery(
    "?language=hi&year=2023&rating=7&runtime=long&sort=rating&genres=28,18,28&page=4",
    "movie",
  );
  expect(readDiscovery(discoverySearch(filters), "movie")).toEqual(filters);
  expect(filters.genres).toEqual(["28", "18"]);
  expect(discoverySearch(readDiscovery("", "movie"))).toBe("");
});

test("invalid bookmarked values cannot send unsupported filters or pages to TMDB", () => {
  const filters = readDiscovery(
    "?language=unknown&year=9999&rating=12&runtime=epic&sort=unsafe&page=501&genres=-1,abc,18",
    "tv",
  );
  expect(filters).toEqual({
    language: "",
    year: "",
    rating: "",
    runtime: "",
    sort: "popular",
    page: 1,
    genres: ["18"],
  });
  expect(readDiscovery("?page=1.5", "movie").page).toBe(1);
  expect(readDiscovery("?page=0", "movie").page).toBe(1);
});
