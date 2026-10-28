import {
  activeStreaming,
  applyStreamingParams,
  availableOnServices,
  isExcluded,
  normalizePersonalization,
  parsePersonalization,
  setTitleFeedback,
} from "./personalization";
import { buildDiscoverPath, discoverySearch, readDiscovery } from "./discovery";
import { buildPickPath } from "./picks";
const movie = { id: 1, media_type: "movie", title: "One" };
const series = { id: 1, media_type: "tv", name: "Series One" };

test("feedback separates movie and TV identities, allows watched likes, and makes hidden and liked exclusive", () => {
  let entries = setTitleFeedback([], movie, "watched", true);
  entries = setTitleFeedback(entries, movie, "liked", true);
  entries = setTitleFeedback(entries, series, "liked", true);
  expect(entries).toHaveLength(2);
  expect(entries.find((e) => e.media_type === "movie")).toMatchObject({
    watched: true,
    liked: true,
  });
  entries = setTitleFeedback(entries, movie, "hidden", true);
  expect(entries[0]).toMatchObject({
    watched: true,
    liked: false,
    hidden: true,
  });
  expect(isExcluded(movie, entries, false)).toBe(true);
  entries = setTitleFeedback(entries, movie, "liked", true);
  expect(entries[0]).toMatchObject({ liked: true, hidden: false });
  expect(isExcluded(movie, entries)).toBe(true);
  expect(isExcluded(movie, entries, false)).toBe(false);
  expect(isExcluded(series, entries)).toBe(false);
});
test("unsetting the last flag removes feedback and invalid records cannot hide unrelated titles", () => {
  const entries = setTitleFeedback([], movie, "hidden", true);
  expect(setTitleFeedback(entries, movie, "hidden", false)).toEqual([]);
  expect(setTitleFeedback(entries, { id: -1 }, "hidden", true)).toBe(entries);
  expect(parsePersonalization("invalid").feedback).toEqual([]);
  expect(
    normalizePersonalization({
      feedback: [
        { id: -1, hidden: true },
        { ...movie, watched: "yes" },
      ],
    }).feedback,
  ).toEqual([]);
});
test("services are validated, deduplicated, and isolated by country", () => {
  const state = normalizePersonalization({
    region: "US",
    onlyMyServices: true,
    services: {
      IN: [{ id: 8, name: "Netflix" }],
      US: [
        { id: 9, name: "Prime" },
        { id: 9, name: "Duplicate" },
        { id: -2, name: "Invalid" },
      ],
    },
  });
  expect(activeStreaming(state)).toEqual({ region: "US", providers: [9] });
  expect(activeStreaming({ ...state, region: "CA" })).toBeNull();
  expect(activeStreaming({ ...state, onlyMyServices: false })).toBeNull();
});
test("provider filters use OR and subscription-only availability for movies, TV and picks", () => {
  const streaming = { region: "IN", providers: [8, 9] };
  for (const type of ["movie", "tv"]) {
    const filters = { ...readDiscovery("", type), ...streaming };
    const params = new URLSearchParams(
      buildDiscoverPath(type, filters).split("?")[1],
    );
    expect(params.get("watch_region")).toBe("IN");
    expect(params.get("with_watch_providers")).toBe("8|9");
    expect(params.get("with_watch_monetization_types")).toBe("flatrate");
    expect(readDiscovery(discoverySearch(filters), type)).toMatchObject(
      streaming,
    );
  }
  const pick = new URLSearchParams(
    buildPickPath({ type: "tv", mood: "any", streaming }, []).split("?")[1],
  );
  expect(pick.get("with_watch_providers")).toBe("8|9");
  const all = new URLSearchParams(
    buildDiscoverPath("movie", {
      ...readDiscovery("", "movie"),
      ...streaming,
      allServices: true,
    }).split("?")[1],
  );
  expect(all.has("with_watch_providers")).toBe(false);
  const invalid = new URLSearchParams();
  applyStreamingParams(invalid, { region: "invalid", providers: [8] });
  expect(invalid.toString()).toBe("");
});
test("renting on a selected service or streaming in another country does not count as included", () => {
  const streaming = { region: "IN", providers: [8] };
  expect(
    availableOnServices(
      {
        results: {
          IN: { rent: [{ provider_id: 8 }], flatrate: [{ provider_id: 9 }] },
          US: { flatrate: [{ provider_id: 8 }] },
        },
      },
      streaming,
    ),
  ).toBe(false);
  expect(
    availableOnServices(
      { results: { IN: { flatrate: [{ provider_id: 8 }] } } },
      streaming,
    ),
  ).toBe(true);
});
