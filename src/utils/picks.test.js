import { buildPickPath, choosePick } from "./picks";
const genres = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 35, name: "Comedy" },
  { id: 10759, name: "Action & Adventure" },
];
test("picker query honors mood, language, time, release date, and media type", () => {
  const path = buildPickPath(
    { type: "movie", mood: "adventure", language: "ta", minutes: "120" },
    genres,
    3,
    "2026-10-25",
  );
  const [endpoint, search] = path.split("?");
  const params = new URLSearchParams(search);
  expect(endpoint).toBe("discover/movie");
  expect(params.get("with_genres")).toBe("28|12|10759");
  expect(params.get("with_original_language")).toBe("ta");
  expect(params.get("with_runtime.lte")).toBe("120");
  expect(params.get("primary_release_date.lte")).toBe("2026-10-25");
  expect(params.get("page")).toBe("3");
  expect(params.get("include_adult")).toBe("false");
  const tv = new URLSearchParams(
    buildPickPath(
      { type: "tv", mood: "light", genre: "18", minutes: "30" },
      genres,
      1,
      "2026-10-25",
    ).split("?")[1],
  );
  expect(tv.get("with_genres")).toBe("18");
  expect(tv.get("first_air_date.lte")).toBe("2026-10-25");
  expect(tv.has("primary_release_date.lte")).toBe(false);
});
test("random picks exclude seen, invalid and adult titles, and keep movie/TV IDs distinct", () => {
  const entries = [
    { id: 1, title: "Seen" },
    { id: 2, title: "New" },
    { id: 2, title: "Duplicate" },
    { id: 3, title: "Adult", adult: true },
    { id: 0, title: "Invalid" },
  ];
  expect(
    choosePick(entries, "movie", new Set(["movie:1"]), () => 0).title,
  ).toBe("New");
  expect(choosePick(entries, "movie", new Set(["movie:1", "movie:2"]))).toBe(
    null,
  );
  expect(
    choosePick(entries, "tv", new Set(["movie:1"]), () => 0).media_type,
  ).toBe("tv");
  expect(choosePick([], "movie")).toBe(null);
});

test("runtime checks use known title runtimes and treat missing data as unknown", () => {
  const { pickRuntime } = require("./picks");
  expect(pickRuntime({ runtime: 155 }, "movie")).toBe(155);
  expect(pickRuntime({ runtime: 0 }, "movie")).toBe(0);
  expect(
    pickRuntime(
      { episode_run_time: [22, 30], last_episode_to_air: { runtime: 40 } },
      "tv",
    ),
  ).toBe(40);
  expect(pickRuntime({ episode_run_time: [] }, "tv")).toBe(0);
});
