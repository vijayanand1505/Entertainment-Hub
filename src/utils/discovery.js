export const LANGUAGES = [
  ["en", "English"],
  ["hi", "Hindi"],
  ["ta", "Tamil"],
  ["te", "Telugu"],
  ["ml", "Malayalam"],
  ["kn", "Kannada"],
  ["bn", "Bengali"],
  ["mr", "Marathi"],
  ["pa", "Punjabi"],
  ["ko", "Korean"],
  ["ja", "Japanese"],
  ["fr", "French"],
  ["es", "Spanish"],
  ["de", "German"],
  ["zh", "Chinese"],
  ["it", "Italian"],
  ["pt", "Portuguese"],
  ["ar", "Arabic"],
  ["tr", "Turkish"],
  ["th", "Thai"],
];
export const RUNTIMES = {
  movie: [
    ["short", "Under 90 minutes", 1, 89],
    ["standard", "90–120 minutes", 90, 120],
    ["long", "121–180 minutes", 121, 180],
    ["epic", "Over 3 hours", 181, null],
  ],
  tv: [
    ["short", "Under 30 minutes", 1, 29],
    ["standard", "30–60 minutes", 30, 60],
    ["long", "Over 60 minutes", 61, null],
  ],
};
export function readDiscovery(search, type) {
  const params = new URLSearchParams(search);
  const year = Number(params.get("year"));
  const page = Number(params.get("page"));
  const language = params.get("language") || "";
  const runtime = params.get("runtime") || "";
  return {
    language: LANGUAGES.some(([code]) => code === language) ? language : "",
    year:
      Number.isInteger(year) &&
      year >= 1888 &&
      year <= new Date().getFullYear() + 1
        ? String(year)
        : "",
    rating: ["6", "7", "8", "9"].includes(params.get("rating"))
      ? params.get("rating")
      : "",
    runtime: RUNTIMES[type].some(([value]) => value === runtime) ? runtime : "",
    sort: ["popular", "rating", "newest"].includes(params.get("sort"))
      ? params.get("sort")
      : "popular",
    genres: [
      ...new Set(
        (params.get("genres") || "")
          .split(",")
          .filter((id) => /^[1-9]\d*$/.test(id)),
      ),
    ].slice(0, 30),
    page: Number.isInteger(page) && page >= 1 && page <= 500 ? page : 1,
  };
}
export function discoverySearch(filters) {
  const params = new URLSearchParams();
  ["language", "year", "rating", "runtime"].forEach((key) => {
    if (filters[key]) params.set(key, filters[key]);
  });
  if (filters.sort !== "popular") params.set("sort", filters.sort);
  if (filters.genres.length) params.set("genres", filters.genres.join(","));
  if (filters.page > 1) params.set("page", filters.page);
  return params.toString() ? "?" + params.toString() : "";
}
export function buildDiscoverPath(type, filters) {
  const params = new URLSearchParams({
    include_adult: "false",
    page: String(filters.page),
  });
  const releaseField =
    type === "movie" ? "primary_release_date" : "first_air_date";
  const sorts = {
    popular: "popularity.desc",
    rating: "vote_average.desc",
    newest: releaseField + ".desc",
  };
  params.set("sort_by", sorts[filters.sort]);
  if (filters.genres.length)
    params.set("with_genres", filters.genres.join(","));
  if (filters.language) params.set("with_original_language", filters.language);
  if (filters.year)
    params.set(
      type === "movie" ? "primary_release_year" : "first_air_date_year",
      filters.year,
    );
  if (filters.rating) params.set("vote_average.gte", filters.rating);
  if (filters.rating || filters.sort === "rating")
    params.set("vote_count.gte", "100");
  const runtime = RUNTIMES[type].find(([value]) => value === filters.runtime);
  if (runtime) {
    params.set("with_runtime.gte", String(runtime[2]));
    if (runtime[3] !== null) params.set("with_runtime.lte", String(runtime[3]));
  }
  if (filters.sort === "newest") {
    const today = new Date();
    const date = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");
    params.set(releaseField + ".lte", date);
  }
  return `discover/${type}?${params.toString()}`;
}
