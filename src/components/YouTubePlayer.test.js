import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import YouTubePlayer from "./YouTubePlayer";
import { loadYouTubeApi } from "../utils/youtube";

jest.mock("../utils/youtube", () => ({ loadYouTubeApi: jest.fn() }));
let instances;
beforeEach(() => {
  instances = [];
  loadYouTubeApi.mockReset();
  loadYouTubeApi.mockResolvedValue({
    Player: jest.fn().mockImplementation((target, options) => {
      const iframe = document.createElement("iframe");
      target.replaceWith(iframe);
      const player = {
        getIframe: () => iframe,
        destroy: jest.fn(() => iframe.remove()),
      };
      instances.push({ options, player });
      return player;
    }),
  });
});
const first = { key: "aaaaaaaaaaa", name: "Official trailer" };

test("switching videos and closing the player destroy the previous playback instance", async () => {
  const view = render(<YouTubePlayer video={first} title="A film" />);
  await waitFor(() => expect(instances).toHaveLength(1));
  act(() => instances[0].options.events.onReady());
  expect(
    view.container.querySelector(".trailer-stage").getAttribute("aria-busy"),
  ).toBe("false");
  expect(view.container.querySelector("iframe").title).toBe(
    "A film — Official trailer",
  );
  view.rerender(
    <YouTubePlayer
      video={{ key: "bbbbbbbbbbb", name: "Teaser" }}
      title="A film"
    />,
  );
  await waitFor(() => expect(instances).toHaveLength(2));
  expect(instances[0].player.destroy).toHaveBeenCalledTimes(1);
  view.unmount();
  expect(instances[1].player.destroy).toHaveBeenCalledTimes(1);
});

test("blocked embeds show a useful error and allow retry", async () => {
  render(<YouTubePlayer video={first} title="A film" />);
  await waitFor(() => expect(instances).toHaveLength(1));
  act(() => instances[0].options.events.onError({ data: 101 }));
  expect(screen.getByRole("alert").textContent).toContain(
    "This video can’t play inside the app.",
  );
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await waitFor(() => expect(instances).toHaveLength(2));
  act(() => instances[1].options.events.onReady());
  expect(screen.queryByRole("alert")).toBeNull();
});

test("player script failures leave a retryable message", async () => {
  loadYouTubeApi.mockRejectedValue(new Error("Offline"));
  render(<YouTubePlayer video={first} title="A film" />);
  await waitFor(() =>
    expect(screen.getByRole("alert").textContent).toContain(
      "The player couldn’t load.",
    ),
  );
  expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
});
