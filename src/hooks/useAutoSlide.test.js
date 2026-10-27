import { act, fireEvent, render, screen } from "@testing-library/react";
import useAutoSlide from "./useAutoSlide";
function Carousel({ count = 5, enabled = true, source = "day" }) {
  const carousel = useAutoSlide(count, enabled, source);
  return (
    <>
      <output>{carousel.index}</output>
      <button onClick={() => carousel.select(3)}>Select fourth</button>
      <button onClick={carousel.togglePlaying}>Toggle autoplay</button>
      <button onClick={() => carousel.setHovered(true)}>Hover</button>
      <button onClick={() => carousel.setHovered(false)}>Leave</button>
      <button onClick={() => carousel.setFocused(true)}>Focus</button>
      <button onClick={() => carousel.setFocused(false)}>Blur</button>
    </>
  );
}
const advance = (milliseconds) =>
  act(() => jest.advanceTimersByTime(milliseconds));
beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.clearAllTimers();
  jest.restoreAllMocks();
  jest.useRealTimers();
});
test("advances exactly every five seconds, wraps all five slides, and clears its timer on unmount", () => {
  const intervals = jest.spyOn(window, "setInterval");
  const clear = jest.spyOn(window, "clearInterval");
  const mounted = render(<Carousel />);
  advance(4999);
  expect(screen.getByRole("status").textContent).toBe("0");
  advance(1);
  expect(screen.getByRole("status").textContent).toBe("1");
  for (const index of [2, 3, 4, 0]) {
    advance(5000);
    expect(screen.getByRole("status").textContent).toBe(String(index));
  }
  const lastTimer =
    intervals.mock.results[intervals.mock.results.length - 1].value;
  mounted.unmount();
  expect(clear).toHaveBeenCalledWith(lastTimer);
});
test("manual selection gets a full five seconds and pause, hover, focus, and open dialogs suspend rotation", () => {
  render(<Carousel />);
  advance(4000);
  fireEvent.click(screen.getByText("Select fourth"));
  advance(4999);
  expect(screen.getByRole("status").textContent).toBe("3");
  advance(1);
  expect(screen.getByRole("status").textContent).toBe("4");
  for (const [pause, resume] of [
    ["Toggle autoplay", "Toggle autoplay"],
    ["Hover", "Leave"],
    ["Focus", "Blur"],
  ]) {
    fireEvent.click(screen.getByText(pause));
    advance(10000);
    expect(screen.getByRole("status").textContent).toBe("4");
    fireEvent.click(screen.getByText(resume));
  }
  const dialog = document.createElement("div");
  dialog.setAttribute("role", "dialog");
  document.body.appendChild(dialog);
  advance(5000);
  expect(screen.getByRole("status").textContent).toBe("4");
  dialog.remove();
  advance(5000);
  expect(screen.getByRole("status").textContent).toBe("0");
});
test("hidden tabs, loading and a single slide do not rotate; a new catalog restarts at slide one", () => {
  const mounted = render(<Carousel />);
  fireEvent.click(screen.getByText("Select fourth"));
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: true,
  });
  fireEvent(document, new Event("visibilitychange"));
  advance(10000);
  expect(screen.getByRole("status").textContent).toBe("3");
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: false,
  });
  fireEvent(document, new Event("visibilitychange"));
  mounted.rerender(<Carousel enabled={false} />);
  advance(10000);
  expect(screen.getByRole("status").textContent).toBe("3");
  mounted.rerender(<Carousel source="week" count={1} />);
  advance(10000);
  expect(screen.getByRole("status").textContent).toBe("0");
});
