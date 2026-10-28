import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  PersonalizationProvider,
  usePersonalization,
} from "./PersonalizationContext";
import { PERSONALIZATION_KEY } from "../utils/personalization";
const movie = { id: 1, media_type: "movie", title: "One" };
function Controls() {
  const state = usePersonalization();
  return (
    <>
      <button onClick={() => state.toggleFeedback(movie, "hidden")}>
        Hide
      </button>
      <button onClick={() => state.toggleFeedback(movie, "liked")}>Like</button>
      <button onClick={() => state.toggleService({ id: 8, name: "Netflix" })}>
        Netflix
      </button>
      <button onClick={() => state.setRegion("US")}>US</button>
      <button onClick={() => state.setRegion("IN")}>IN</button>
      <output aria-label="Feedback">{JSON.stringify(state.feedback)}</output>
      <output aria-label="Streaming">{JSON.stringify(state.streaming)}</output>
      <output aria-label="Persistent">{String(state.persistent)}</output>
    </>
  );
}
beforeEach(() => localStorage.clear());
afterEach(() => jest.restoreAllMocks());
test("feedback and subscriptions persist, undo restores the prior like, and country selections remain separate", () => {
  const first = render(
    <PersonalizationProvider>
      <Controls />
    </PersonalizationProvider>,
  );
  fireEvent.click(screen.getByText("Like"));
  fireEvent.click(screen.getByText("Hide"));
  expect(
    JSON.parse(screen.getByLabelText("Feedback").textContent)[0],
  ).toMatchObject({ hidden: true, liked: false });
  fireEvent.click(screen.getByText("Undo"));
  expect(
    JSON.parse(screen.getByLabelText("Feedback").textContent)[0],
  ).toMatchObject({ hidden: false, liked: true });
  fireEvent.click(screen.getByText("Netflix"));
  fireEvent.click(screen.getByText("US"));
  expect(screen.getByLabelText("Streaming").textContent).toBe("null");
  fireEvent.click(screen.getByText("IN"));
  expect(JSON.parse(screen.getByLabelText("Streaming").textContent)).toEqual({
    region: "IN",
    providers: [8],
  });
  first.unmount();
  render(
    <PersonalizationProvider>
      <Controls />
    </PersonalizationProvider>,
  );
  expect(
    JSON.parse(screen.getByLabelText("Feedback").textContent)[0].liked,
  ).toBe(true);
  expect(
    JSON.parse(screen.getByLabelText("Streaming").textContent).providers,
  ).toEqual([8]);
});
test("storage events update other tabs and clearing storage resets feedback and services", () => {
  render(
    <PersonalizationProvider>
      <Controls />
    </PersonalizationProvider>,
  );
  act(() => {
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: PERSONALIZATION_KEY,
        newValue: JSON.stringify({ feedback: [{ ...movie, hidden: true }] }),
      }),
    );
  });
  expect(
    JSON.parse(screen.getByLabelText("Feedback").textContent)[0].hidden,
  ).toBe(true);
  act(() => {
    window.dispatchEvent(new StorageEvent("storage", { key: null }));
  });
  expect(screen.getByLabelText("Feedback").textContent).toBe("[]");
});
test("blocked storage keeps changes in memory and reports that they last for this visit", () => {
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  render(
    <PersonalizationProvider>
      <Controls />
    </PersonalizationProvider>,
  );
  fireEvent.click(screen.getByText("Hide"));
  fireEvent.click(screen.getByText("Netflix"));
  expect(screen.getByLabelText("Persistent").textContent).toBe("false");
  expect(
    JSON.parse(screen.getByLabelText("Feedback").textContent)[0].hidden,
  ).toBe(true);
  expect(
    JSON.parse(screen.getByLabelText("Streaming").textContent).providers,
  ).toEqual([8]);
});
