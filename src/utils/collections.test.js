import {
  collectionError,
  collectionsReducer,
  parseCollections,
} from "./collections";
const movie = { id: 42, media_type: "movie", title: "A movie" };
const show = { id: 42, media_type: "tv", name: "A series" };
const create = (state = [], id = "weekend", name = "Weekend movies") =>
  collectionsReducer(state, {
    type: "UPSERT",
    id,
    draft: { name, color: "violet", description: "Watch together" },
    timestamp: 1,
  });
test("collection storage rejects malformed entries, deduplicates titles, and normalizes metadata", () => {
  expect(parseCollections("bad")).toEqual([]);
  expect(parseCollections("{}")).toEqual([]);
  const parsed = parseCollections(
    JSON.stringify([
      null,
      { id: "bad/id", name: "Invalid" },
      {
        id: "weekend",
        name: "  Weekend   movies ",
        color: "unknown",
        items: [movie, movie, show, { id: 0 }],
      },
      { id: "weekend", name: "Duplicate" },
    ]),
  );
  expect(parsed).toHaveLength(1);
  expect(parsed[0].name).toBe("Weekend movies");
  expect(parsed[0].color).toBe("ember");
  expect(parsed[0].items).toHaveLength(2);
});
test("collection CRUD preserves membership through renames and isolates movie/TV IDs", () => {
  let state = create();
  state = collectionsReducer(state, {
    type: "TOGGLE",
    id: "weekend",
    item: movie,
    timestamp: 2,
  });
  state = collectionsReducer(state, {
    type: "TOGGLE",
    id: "weekend",
    item: show,
    timestamp: 3,
  });
  expect(state[0].items.map((i) => i.media_type)).toEqual(["tv", "movie"]);
  state = collectionsReducer(state, {
    type: "UPSERT",
    id: "weekend",
    draft: { name: "Family night", color: "ocean" },
    timestamp: 4,
  });
  expect(state[0].items).toHaveLength(2);
  expect(state[0].createdAt).toBe(1);
  state = collectionsReducer(state, {
    type: "TOGGLE",
    id: "weekend",
    item: movie,
    timestamp: 5,
  });
  expect(state[0].items).toHaveLength(1);
  expect(state[0].items[0].media_type).toBe("tv");
  const previous = state[0];
  state = collectionsReducer(state, { type: "DELETE", id: "weekend" });
  expect(state).toEqual([]);
  state = collectionsReducer(state, { type: "RESTORE", entry: previous });
  expect(state[0]).toEqual(previous);
  expect(
    collectionsReducer(state, { type: "RESTORE", entry: previous }),
  ).toHaveLength(1);
});
test("blank and duplicate names are rejected and collection size is bounded", () => {
  const state = create();
  expect(collectionError(state, { name: "   " })).toMatch(/name/);
  expect(collectionError(state, { name: " weekend MOVIES " })).toMatch(
    /already exists/,
  );
  expect(collectionError(state, { name: "Weekend movies" }, "weekend")).toBe(
    "",
  );
  expect(create(state, "new", "Weekend movies")).toBe(state);
  const full = Array.from({ length: 100 }, (_, i) => ({
    id: "c" + i,
    name: "Collection " + i,
    items: [],
  }));
  expect(create(full, "overflow", "Another")).toBe(full);
});
