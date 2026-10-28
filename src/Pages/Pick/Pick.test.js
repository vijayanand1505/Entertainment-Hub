import {
  fireEvent,
  render as renderPage,
  screen,
} from "@testing-library/react";
import { Link, MemoryRouter, Route, Switch } from "react-router-dom";
import axios from "axios";
import Pick from "./Pick";
import { PersonalizationProvider } from "../../context/PersonalizationContext";
const render = (ui) =>
  renderPage(<PersonalizationProvider>{ui}</PersonalizationProvider>);
import { PICK_SESSION_KEY } from "../../utils/pickSession";

jest.mock("axios", () => ({
  ...jest.requireActual("axios"),
  get: jest.fn(),
}));
jest.mock("../../hooks/useTmdb", () => () => ({
  data: { genres: [{ id: 35, name: "Comedy" }] },
  loading: false,
  error: false,
}));
jest.mock("../../context/TitleModalContext", () => ({
  useTitleModal: () => jest.fn(),
}));
jest.mock("../../context/TrailerContext", () => ({
  useTrailer: () => jest.fn(),
}));
jest.mock("../../components/SaveButton", () => () => null);
jest.mock("../../components/CollectionButton", () => () => null);

function AppTabs() {
  return (
    <MemoryRouter initialEntries={["/pick-for-me"]}>
      <nav>
        <Link to="/movies">Movies tab</Link>
        <Link to="/pick-for-me">Pick tab</Link>
      </nav>
      <Switch>
        <Route path="/pick-for-me" component={Pick} />
        <Route path="/movies">Movies</Route>
      </Switch>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  axios.get.mockReset();
  axios.get.mockResolvedValue({
    data: {
      total_pages: 1,
      results: [
        { id: 1, title: "Tonight’s movie", overview: "A saved story." },
      ],
    },
  });
  jest.spyOn(Math, "random").mockReturnValue(0);
});
afterEach(() => jest.restoreAllMocks());

test("keeps a pick across tabs, preference changes, and reloads until manually cleared", async () => {
  const visit = render(<AppTabs />);
  fireEvent.change(screen.getByLabelText("Preferred genre"), {
    target: { value: "35" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Pick for me" }));
  await screen.findByRole("heading", { name: "Tonight’s movie" });
  expect(document.querySelector(".pick-match").textContent).toBe("Comedy");

  fireEvent.click(screen.getByText("Movies tab"));
  expect(screen.queryByRole("heading", { name: "Tonight’s movie" })).toBeNull();
  fireEvent.click(screen.getByText("Pick tab"));
  expect(screen.getByRole("heading", { name: "Tonight’s movie" })).toBeTruthy();
  expect(screen.getByLabelText("Preferred genre").value).toBe("35");
  expect(axios.get).toHaveBeenCalledTimes(1);

  fireEvent.click(screen.getByRole("button", { name: "TV series" }));
  expect(screen.getByRole("heading", { name: "Tonight’s movie" })).toBeTruthy();
  expect(document.querySelector(".pick-match").textContent).toBe("Comedy");
  visit.unmount();

  const reloaded = render(<AppTabs />);
  expect(screen.getByRole("heading", { name: "Tonight’s movie" })).toBeTruthy();
  expect(
    screen
      .getByRole("button", { name: "TV series" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  expect(screen.getByText("A saved story.")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Clear pick" }));
  expect(screen.queryByRole("heading", { name: "Tonight’s movie" })).toBeNull();
  expect(JSON.parse(localStorage.getItem(PICK_SESSION_KEY)).item).toBeNull();
  fireEvent.click(screen.getByText("Movies tab"));
  fireEvent.click(screen.getByText("Pick tab"));
  expect(screen.queryByRole("heading", { name: "Tonight’s movie" })).toBeNull();
  reloaded.unmount();
  render(<AppTabs />);
  expect(screen.queryByRole("heading", { name: "Tonight’s movie" })).toBeNull();
});

test("an unsuccessful replacement keeps the current recommendation visible", async () => {
  render(<AppTabs />);
  fireEvent.click(screen.getByRole("button", { name: "Pick for me" }));
  await screen.findByRole("heading", { name: "Tonight’s movie" });
  axios.get.mockRejectedValueOnce(new Error("offline"));
  fireEvent.click(screen.getByRole("button", { name: "Try another" }));
  await screen.findByRole("alert");
  expect(screen.getByRole("heading", { name: "Tonight’s movie" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Try another" }));
  await screen.findByText(/No new matches in this selection/);
  expect(screen.getByRole("heading", { name: "Tonight’s movie" })).toBeTruthy();
});
