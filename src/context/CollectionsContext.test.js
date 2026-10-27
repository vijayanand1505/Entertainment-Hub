import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CollectionsProvider, useCollections } from "./CollectionsContext";
import { COLLECTIONS_KEY } from "../utils/collections";
const movie = { id: 42, media_type: "movie", title: "A movie" };
function Controls() {
  const { collections, persistent, saveCollection, toggleTitle } =
    useCollections();
  return (
    <>
      <button onClick={() => saveCollection({ name: "Weekend" })}>
        Create
      </button>
      <button onClick={() => toggleTitle(collections[0].id, movie)}>
        Add movie
      </button>
      <output aria-label="Collection count">{collections.length}</output>
      <output aria-label="Title count">
        {collections[0]?.items.length || 0}
      </output>
      <output aria-label="Persistent">{String(persistent)}</output>
    </>
  );
}
const App = () => (
  <MemoryRouter>
    <CollectionsProvider>
      <Controls />
    </CollectionsProvider>
  </MemoryRouter>
);
beforeEach(() => localStorage.clear());
afterEach(() => jest.restoreAllMocks());
test("collections and their titles persist after remount without changing the watchlist", () => {
  localStorage.setItem("eh-watchlist-v1", "keep");
  const mounted = render(<App />);
  fireEvent.click(screen.getByText("Create"));
  fireEvent.click(screen.getByText("Add movie"));
  expect(JSON.parse(localStorage.getItem(COLLECTIONS_KEY))[0].items[0].id).toBe(
    42,
  );
  mounted.unmount();
  render(<App />);
  expect(screen.getByLabelText("Collection count").textContent).toBe("1");
  expect(screen.getByLabelText("Title count").textContent).toBe("1");
  expect(localStorage.getItem("eh-watchlist-v1")).toBe("keep");
});
test("collections synchronize across tabs and tolerate damaged storage", () => {
  render(<App />);
  act(() => {
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: COLLECTIONS_KEY,
        newValue: JSON.stringify([
          { id: "sync", name: "From another tab", items: [movie] },
        ]),
      }),
    );
  });
  expect(screen.getByLabelText("Title count").textContent).toBe("1");
  act(() => {
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: COLLECTIONS_KEY,
        newValue: "damaged",
      }),
    );
  });
  expect(screen.getByLabelText("Collection count").textContent).toBe("0");
});
test("collections remain usable when browser storage is unavailable", () => {
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  render(<App />);
  fireEvent.click(screen.getByText("Create"));
  fireEvent.click(screen.getByText("Add movie"));
  expect(screen.getByLabelText("Title count").textContent).toBe("1");
  expect(screen.getByLabelText("Persistent").textContent).toBe("false");
});
