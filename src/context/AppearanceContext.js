import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { createMuiTheme, ThemeProvider } from "@material-ui/core";
import {
  APPEARANCE_KEY,
  DEFAULT_APPEARANCE,
  FONT_SIZES,
  normalizeAppearance,
  parseAppearance,
  resolveTheme,
} from "../utils/appearance";

const AppearanceContext = createContext(null);
const read = () => {
  try {
    return parseAppearance(localStorage.getItem(APPEARANCE_KEY));
  } catch {
    return { ...DEFAULT_APPEARANCE };
  }
};
export function AppearanceProvider({ children }) {
  const [preferences, setPreferences] = useState(read);
  const [persistent, setPersistent] = useState(true);
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true,
  );
  const resolvedTheme = resolveTheme(preferences.theme, systemDark);
  useEffect(() => {
    if (!window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(media.matches);
    update();
    if (media.addEventListener) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolvedTheme;
    root.dataset.textSize = preferences.textSize;
    root.dataset.density = preferences.density;
    root.style.fontSize = FONT_SIZES[preferences.textSize] + "px";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = resolvedTheme === "light" ? "#f5f5f7" : "#111214";
  }, [preferences.textSize, preferences.density, resolvedTheme]);
  useEffect(() => {
    try {
      const json = JSON.stringify(preferences);
      if (localStorage.getItem(APPEARANCE_KEY) !== json)
        localStorage.setItem(APPEARANCE_KEY, json);
      setPersistent(true);
    } catch {
      setPersistent(false);
    }
  }, [preferences]);
  useEffect(() => {
    const sync = (event) => {
      if (event.key === APPEARANCE_KEY || event.key === null)
        setPreferences(parseAppearance(event.newValue));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const update = useCallback(
    (patch) =>
      setPreferences((current) =>
        normalizeAppearance({ ...current, ...patch }),
      ),
    [],
  );
  const reset = useCallback(
    () => setPreferences({ ...DEFAULT_APPEARANCE }),
    [],
  );
  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: resolvedTheme,
          primary: {
            main: resolvedTheme === "light" ? "#b84420" : "#ff8058",
            contrastText: resolvedTheme === "light" ? "#ffffff" : "#15110f",
          },
          background: {
            default: resolvedTheme === "light" ? "#f5f5f7" : "#111214",
            paper: resolvedTheme === "light" ? "#ffffff" : "#1a1b1f",
          },
          text: {
            primary: resolvedTheme === "light" ? "#202129" : "#f5f3ef",
            secondary: resolvedTheme === "light" ? "#646572" : "#a4a4ad",
          },
        },
        typography: {
          fontFamily: '"DM Sans", sans-serif',
          button: { textTransform: "none", fontWeight: 600 },
        },
        shape: { borderRadius: 12 },
      }),
    [resolvedTheme],
  );
  const value = useMemo(
    () => ({ preferences, resolvedTheme, persistent, update, reset }),
    [preferences, resolvedTheme, persistent, update, reset],
  );
  return (
    <AppearanceContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </AppearanceContext.Provider>
  );
}
export function useAppearance() {
  const value = useContext(AppearanceContext);
  if (!value) throw new Error("useAppearance requires AppearanceProvider");
  return value;
}
