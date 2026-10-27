import { fireEvent, render, screen } from "@testing-library/react";
import { LibraryProvider, useLibrary } from "./LibraryContext";
import { WATCHLIST_KEY, HISTORY_KEY } from "../utils/library";

const movie = { id: 157336, media_type: "movie", title: "Interstellar" };
function Controls() {
  const { watchlist, recentlyViewed, toggleSaved, recordView } = useLibrary();
  return (
    <>
      <button onClick={() => toggleSaved(movie)}>Save movie</button>
      <button onClick={() => recordView(movie)}>View movie</button>
      <output aria-label="Saved count">{watchlist.length}</output>
      <output aria-label="Viewed count">{recentlyViewed.length}</output>
    </>
  );
}
beforeEach(() => localStorage.clear());
afterEach(() => jest.restoreAllMocks());

test("saved titles and viewing history survive a fresh provider mount", () => {
  const first = render(
    <LibraryProvider>
      <Controls />
    </LibraryProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Save movie" }));
  fireEvent.click(screen.getByRole("button", { name: "View movie" }));
  expect(JSON.parse(localStorage.getItem(WATCHLIST_KEY))[0].title).toBe(
    "Interstellar",
  );
  expect(JSON.parse(localStorage.getItem(HISTORY_KEY))[0].id).toBe(157336);
  first.unmount();
  render(
    <LibraryProvider>
      <Controls />
    </LibraryProvider>,
  );
  expect(screen.getByLabelText("Saved count").textContent).toBe("1");
  expect(screen.getByLabelText("Viewed count").textContent).toBe("1");
});

test("saving still works for this visit when browser storage is blocked", () => {
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("Storage blocked");
  });
  render(
    <LibraryProvider>
      <Controls />
    </LibraryProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Save movie" }));
  expect(screen.getByLabelText("Saved count").textContent).toBe("1");
  expect(
    screen.getByText("Updated for this visit. Browser storage is unavailable."),
  ).toBeTruthy();
});
