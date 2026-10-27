export const APPEARANCE_KEY = "eh-appearance-v1";
export const DEFAULT_APPEARANCE = {
  theme: "dark",
  textSize: "standard",
  density: "comfortable",
};
export const FONT_SIZES = { standard: 16, large: 18, xlarge: 20 };
export function normalizeAppearance(value) {
  const input =
    value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {
    theme: ["dark", "light", "system"].includes(input.theme)
      ? input.theme
      : DEFAULT_APPEARANCE.theme,
    textSize: ["standard", "large", "xlarge"].includes(input.textSize)
      ? input.textSize
      : DEFAULT_APPEARANCE.textSize,
    density: ["comfortable", "compact"].includes(input.density)
      ? input.density
      : DEFAULT_APPEARANCE.density,
  };
}
export function parseAppearance(raw) {
  try {
    return normalizeAppearance(JSON.parse(raw || "{}"));
  } catch {
    return { ...DEFAULT_APPEARANCE };
  }
}
export function resolveTheme(preference, systemDark) {
  return preference === "system"
    ? systemDark
      ? "dark"
      : "light"
    : preference === "light"
      ? "light"
      : "dark";
}
