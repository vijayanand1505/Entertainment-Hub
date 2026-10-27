import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { AppearanceProvider, useAppearance } from "./AppearanceContext";
import {
  APPEARANCE_KEY,
  DEFAULT_APPEARANCE,
  parseAppearance,
} from "../utils/appearance";

function Controls() {
  const { preferences, resolvedTheme, persistent, update, reset } =
    useAppearance();
  return (
    <>
      <button onClick={() => update({ theme: "light" })}>Light</button>
      <button onClick={() => update({ theme: "system" })}>Device</button>
      <button
        onClick={() => update({ textSize: "xlarge", density: "compact" })}
      >
        Bigger and compact
      </button>
      <button onClick={reset}>Reset</button>
      <output aria-label="Resolved theme">{resolvedTheme}</output>
      <output aria-label="Preferences">{JSON.stringify(preferences)}</output>
      <output aria-label="Storage available">{String(persistent)}</output>
    </>
  );
}
let dark;
let listeners;
const originalMatchMedia = window.matchMedia;
beforeEach(() => {
  localStorage.clear();
  dark = false;
  listeners = new Set();
  document.documentElement.removeAttribute("style");
  ["data-theme", "data-text-size", "data-density"].forEach((key) =>
    document.documentElement.removeAttribute(key),
  );
  window.matchMedia = jest.fn(() => ({
    get matches() {
      return dark;
    },
    addEventListener: (_, listener) => listeners.add(listener),
    removeEventListener: (_, listener) => listeners.delete(listener),
  }));
});
afterEach(() => {
  jest.restoreAllMocks();
  window.matchMedia = originalMatchMedia;
});

test("malformed and partial settings normalize to supported choices", () => {
  expect(parseAppearance("broken")).toEqual(DEFAULT_APPEARANCE);
  expect(parseAppearance("null")).toEqual(DEFAULT_APPEARANCE);
  expect(parseAppearance('["light"]')).toEqual(DEFAULT_APPEARANCE);
  expect(
    parseAppearance('{"theme":"light","textSize":"huge","density":"invalid"}'),
  ).toEqual({ ...DEFAULT_APPEARANCE, theme: "light" });
});

test("appearance changes apply to the document and survive a fresh mount", () => {
  const first = render(
    <AppearanceProvider>
      <Controls />
    </AppearanceProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Light", exact: true }));
  fireEvent.click(screen.getByRole("button", { name: "Bigger and compact" }));
  expect(document.documentElement.dataset.theme).toBe("light");
  expect(document.documentElement.dataset.density).toBe("compact");
  expect(document.documentElement.style.fontSize).toBe("20px");
  first.unmount();
  render(
    <AppearanceProvider>
      <Controls />
    </AppearanceProvider>,
  );
  expect(screen.getByLabelText("Resolved theme").textContent).toBe("light");
  expect(JSON.parse(screen.getByLabelText("Preferences").textContent)).toEqual({
    theme: "light",
    textSize: "xlarge",
    density: "compact",
  });
});

test("device mode follows system changes while an explicit theme remains selected", () => {
  render(
    <AppearanceProvider>
      <Controls />
    </AppearanceProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Device", exact: true }));
  expect(document.documentElement.dataset.theme).toBe("light");
  act(() => {
    dark = true;
    listeners.forEach((listener) => listener());
  });
  expect(document.documentElement.dataset.theme).toBe("dark");
  fireEvent.click(screen.getByRole("button", { name: "Light", exact: true }));
  act(() => {
    dark = false;
    listeners.forEach((listener) => listener());
    dark = true;
    listeners.forEach((listener) => listener());
  });
  expect(document.documentElement.dataset.theme).toBe("light");
});

test("settings synchronize from another tab and resetting preserves the library", () => {
  localStorage.setItem("eh-watchlist-v1", "saved movies");
  localStorage.setItem("eh-viewing-history-v1", "viewing history");
  render(
    <AppearanceProvider>
      <Controls />
    </AppearanceProvider>,
  );
  act(() => {
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: APPEARANCE_KEY,
        newValue: JSON.stringify({
          theme: "light",
          textSize: "large",
          density: "compact",
        }),
      }),
    );
  });
  expect(document.documentElement.dataset.theme).toBe("light");
  expect(document.documentElement.style.fontSize).toBe("18px");
  fireEvent.click(screen.getByRole("button", { name: "Reset", exact: true }));
  expect(JSON.parse(screen.getByLabelText("Preferences").textContent)).toEqual(
    DEFAULT_APPEARANCE,
  );
  expect(localStorage.getItem("eh-watchlist-v1")).toBe("saved movies");
  expect(localStorage.getItem("eh-viewing-history-v1")).toBe("viewing history");
});

test("choices still apply in memory when browser storage is unavailable", async () => {
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("Blocked");
  });
  render(
    <AppearanceProvider>
      <Controls />
    </AppearanceProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Light", exact: true }));
  expect(document.documentElement.dataset.theme).toBe("light");
  await waitFor(() =>
    expect(screen.getByLabelText("Storage available").textContent).toBe(
      "false",
    ),
  );
});
