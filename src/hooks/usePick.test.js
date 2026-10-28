import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import axios from "axios";
import usePick from "./usePick";
import { PICK_SESSION_KEY } from "../utils/pickSession";
jest.mock("axios", () => {
  const actual = jest.requireActual("axios");
  return { ...actual, get: jest.fn() };
});
const filters = {
  type: "movie",
  mood: "any",
  genre: "",
  language: "",
  minutes: "",
};
function Controls() {
  const state = usePick();
  return (
    <>
      <button onClick={() => state.pick(filters, [])}>Pick</button>
      <button onClick={() => state.pick({ ...filters, language: "ta" }, [])}>
        Tamil
      </button>
      <button onClick={state.reset}>Reset</button>
      <output aria-label="Status">
        {state.loading
          ? "loading"
          : state.error
            ? "error"
            : state.empty
              ? "empty"
              : state.item?.title || "idle"}
      </output>
    </>
  );
}
beforeEach(() => {
  localStorage.clear();
  axios.get.mockReset();
  jest.spyOn(Math, "random").mockReturnValue(0);
});
afterEach(() => jest.restoreAllMocks());
test("try another avoids repeats, handles exhausted matches, and resets when filters change", async () => {
  axios.get.mockResolvedValue({
    data: {
      total_pages: 1,
      results: [
        { id: 1, title: "One" },
        { id: 2, title: "Two" },
      ],
    },
  });
  render(<Controls />);
  fireEvent.click(screen.getByText("Pick"));
  await waitFor(() =>
    expect(screen.getByLabelText("Status").textContent).toBe("One"),
  );
  fireEvent.click(screen.getByText("Pick"));
  await waitFor(() =>
    expect(screen.getByLabelText("Status").textContent).toBe("Two"),
  );
  fireEvent.click(screen.getByText("Pick"));
  await waitFor(() =>
    expect(screen.getByLabelText("Status").textContent).toBe("empty"),
  );
  fireEvent.click(screen.getByText("Tamil"));
  await waitFor(() =>
    expect(screen.getByLabelText("Status").textContent).toBe("One"),
  );
});
test("request failures can be retried without losing the selection criteria", async () => {
  axios.get.mockRejectedValueOnce(new Error("offline")).mockResolvedValue({
    data: { total_pages: 1, results: [{ id: 1, title: "Back online" }] },
  });
  render(<Controls />);
  fireEvent.click(screen.getByText("Tamil"));
  await waitFor(() =>
    expect(screen.getByLabelText("Status").textContent).toBe("error"),
  );
  fireEvent.click(screen.getByText("Tamil"));
  await waitFor(() =>
    expect(screen.getByLabelText("Status").textContent).toBe("Back online"),
  );
  expect(axios.get.mock.calls[1][0]).toContain("with_original_language=ta");
});
test("stale requests cannot replace a newer pick and reset cancels active requests", async () => {
  let resolveFirst;
  axios.get
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve;
        }),
    )
    .mockResolvedValueOnce({
      data: { total_pages: 1, results: [{ id: 2, title: "Current" }] },
    });
  render(<Controls />);
  fireEvent.click(screen.getByText("Pick"));
  const firstToken = axios.get.mock.calls[0][1].cancelToken;
  fireEvent.click(screen.getByText("Tamil"));
  await waitFor(() =>
    expect(screen.getByLabelText("Status").textContent).toBe("Current"),
  );
  expect(firstToken.reason).toBeTruthy();
  await act(async () => {
    resolveFirst({
      data: { total_pages: 1, results: [{ id: 1, title: "Stale" }] },
    });
  });
  expect(screen.getByLabelText("Status").textContent).toBe("Current");
  fireEvent.click(screen.getByText("Reset"));
  expect(screen.getByLabelText("Status").textContent).toBe("idle");
});

test("time-limited picks verify title details and skip long or unknown runtimes", async () => {
  const results = [
    { id: 1, title: "Too long" },
    { id: 2, title: "Unknown runtime" },
    { id: 3, title: "Fits tonight" },
  ];
  axios.get.mockImplementation((url) => {
    if (url.includes("/discover/"))
      return Promise.resolve({ data: { total_pages: 1, results } });
    const runtime = url.endsWith("/1") ? 155 : url.endsWith("/2") ? 0 : 110;
    return Promise.resolve({ data: { runtime } });
  });
  function Timed() {
    const state = usePick();
    return (
      <>
        <button onClick={() => state.pick({ ...filters, minutes: "120" }, [])}>
          Timed pick
        </button>
        <output aria-label="Result">{state.item?.title || "waiting"}</output>
        <output aria-label="Verified minutes">
          {state.item?.pick_runtime || 0}
        </output>
      </>
    );
  }
  render(<Timed />);
  fireEvent.click(screen.getByText("Timed pick"));
  await waitFor(() =>
    expect(screen.getByLabelText("Result").textContent).toBe("Fits tonight"),
  );
  expect(screen.getByLabelText("Verified minutes").textContent).toBe("110");
  expect(axios.get).toHaveBeenCalledTimes(4);
});

test("restores the current pick and repeat history after leaving and returning", async () => {
  axios.get.mockResolvedValue({
    data: {
      total_pages: 1,
      results: [
        { id: 1, title: "One" },
        { id: 2, title: "Two" },
      ],
    },
  });
  const firstVisit = render(<Controls />);
  fireEvent.click(screen.getByText("Pick"));
  await waitFor(() =>
    expect(screen.getByLabelText("Status").textContent).toBe("One"),
  );
  firstVisit.unmount();
  const returnVisit = render(<Controls />);
  expect(screen.getByLabelText("Status").textContent).toBe("One");
  expect(axios.get).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByText("Pick"));
  await waitFor(() =>
    expect(screen.getByLabelText("Status").textContent).toBe("Two"),
  );
  fireEvent.click(screen.getByText("Reset"));
  returnVisit.unmount();
  render(<Controls />);
  expect(screen.getByLabelText("Status").textContent).toBe("idle");
  expect(JSON.parse(localStorage.getItem(PICK_SESSION_KEY)).item).toBeNull();
  fireEvent.click(screen.getByText("Pick"));
  await waitFor(() =>
    expect(screen.getByLabelText("Status").textContent).toBe("One"),
  );
});

test("a failed or exhausted retry preserves the saved successful pick", async () => {
  axios.get.mockResolvedValue({
    data: { total_pages: 1, results: [{ id: 1, title: "Keep this" }] },
  });
  const visit = render(<Controls />);
  fireEvent.click(screen.getByText("Pick"));
  await waitFor(() =>
    expect(screen.getByLabelText("Status").textContent).toBe("Keep this"),
  );
  axios.get.mockRejectedValueOnce(new Error("offline"));
  fireEvent.click(screen.getByText("Pick"));
  await waitFor(() =>
    expect(screen.getByLabelText("Status").textContent).toBe("error"),
  );
  expect(JSON.parse(localStorage.getItem(PICK_SESSION_KEY)).item.title).toBe(
    "Keep this",
  );
  fireEvent.click(screen.getByText("Pick"));
  await waitFor(() =>
    expect(screen.getByLabelText("Status").textContent).toBe("empty"),
  );
  visit.unmount();
  render(<Controls />);
  expect(screen.getByLabelText("Status").textContent).toBe("Keep this");
});

test("navigation cancels an unfinished replacement without overwriting the saved pick", async () => {
  let resolveReplacement;
  axios.get
    .mockResolvedValueOnce({
      data: { total_pages: 1, results: [{ id: 1, title: "Original" }] },
    })
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveReplacement = resolve;
        }),
    );
  const visit = render(<Controls />);
  fireEvent.click(screen.getByText("Pick"));
  await waitFor(() =>
    expect(screen.getByLabelText("Status").textContent).toBe("Original"),
  );
  fireEvent.click(screen.getByText("Pick"));
  const token = axios.get.mock.calls[1][1].cancelToken;
  visit.unmount();
  expect(token.reason).toBeTruthy();
  await act(async () => {
    resolveReplacement({
      data: { total_pages: 1, results: [{ id: 2, title: "Too late" }] },
    });
  });
  render(<Controls />);
  expect(screen.getByLabelText("Status").textContent).toBe("Original");
});

test("invalid saved data is ignored and unavailable storage does not break picking", async () => {
  localStorage.setItem(PICK_SESSION_KEY, "invalid JSON");
  const visit = render(<Controls />);
  expect(screen.getByLabelText("Status").textContent).toBe("idle");
  visit.unmount();
  jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  axios.get.mockResolvedValue({
    data: { total_pages: 1, results: [{ id: 1, title: "Still works" }] },
  });
  render(<Controls />);
  fireEvent.click(screen.getByText("Pick"));
  await waitFor(() =>
    expect(screen.getByLabelText("Status").textContent).toBe("Still works"),
  );
});

test("picks skip watched and hidden titles and verify subscription access instead of rentals", async () => {
  const results = [
    { id: 1, title: "Watched" },
    { id: 2, title: "Hidden" },
    { id: 3, title: "Rental" },
    { id: 4, title: "Included" },
  ];
  axios.get.mockImplementation((url) =>
    Promise.resolve({
      data: url.includes("/discover/")
        ? { total_pages: 1, results }
        : {
            results: {
              IN: url.includes("/movie/3/")
                ? { rent: [{ provider_id: 8 }] }
                : { flatrate: [{ provider_id: 8 }] },
            },
          },
    }),
  );
  function Personalized() {
    const state = usePick({
      streaming: { region: "IN", providers: [8] },
      feedback: [
        { id: 1, media_type: "movie", watched: true },
        { id: 2, media_type: "movie", hidden: true },
      ],
    });
    return (
      <>
        <button onClick={() => state.pick(filters, [])}>
          Personalized pick
        </button>
        <output aria-label="Personalized result">{state.item?.title}</output>
      </>
    );
  }
  render(<Personalized />);
  fireEvent.click(screen.getByText("Personalized pick"));
  await waitFor(() =>
    expect(screen.getByLabelText("Personalized result").textContent).toBe(
      "Included",
    ),
  );
  expect(axios.get.mock.calls[0][0]).toContain(
    "with_watch_monetization_types=flatrate",
  );
  expect(
    axios.get.mock.calls.some(([url]) => /movie\/[12]\/watch/.test(url)),
  ).toBe(false);
});
