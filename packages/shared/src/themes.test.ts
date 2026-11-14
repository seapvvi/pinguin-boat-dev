import { describe, expect, it } from "vitest";
import {
  CLASSIC_THEME,
  DEFAULT_THEME_ID,
  FREE_THEMES,
  SUPPORTER_THEMES,
  THEME_LIST,
  getTheme,
  isSupporterTheme,
  isThemeAllowed,
  isThemeName,
  normalizeThemeId,
} from "./themes";

describe("theme registry", () => {
  it("ships the four free palettes, classic first", () => {
    expect(FREE_THEMES.map((theme) => theme.id)).toEqual([
      "classic",
      "dark",
      "oled",
      "light",
    ]);
    expect(FREE_THEMES[0]).toBe(CLASSIC_THEME);
    expect(DEFAULT_THEME_ID).toBe("classic");
  });

  it("keeps community palettes behind the supporter tier", () => {
    expect(SUPPORTER_THEMES.length).toBeGreaterThanOrEqual(6);
    expect(SUPPORTER_THEMES.map((theme) => theme.id)).toContain("everforest");
    expect(SUPPORTER_THEMES.map((theme) => theme.id)).toContain("catppuccin");
    expect(SUPPORTER_THEMES.every((theme) => theme.tier === "supporter")).toBe(
      true,
    );
    expect(THEME_LIST).toHaveLength(
      FREE_THEMES.length + SUPPORTER_THEMES.length,
    );
  });

  it("resolves every registered id without collisions", () => {
    const ids = THEME_LIST.map((theme) => theme.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(getTheme(id).id).toBe(id);
    }
  });

  it("normalizes legacy and unknown values", () => {
    expect(normalizeThemeId("halftone")).toBe("classic");
    expect(normalizeThemeId("HALFTONE")).toBe("classic");
    expect(normalizeThemeId("tokyo-night")).toBe("tokyo-night");
    expect(normalizeThemeId("not-a-theme")).toBe(DEFAULT_THEME_ID);
    expect(normalizeThemeId(undefined)).toBe(DEFAULT_THEME_ID);
  });

  it("gates supporter themes on the supporter flag", () => {
    expect(isThemeAllowed("classic", false)).toBe(true);
    expect(isThemeAllowed("oled", false)).toBe(true);
    expect(isThemeAllowed("catppuccin", false)).toBe(false);
    expect(isThemeAllowed("catppuccin", true)).toBe(true);
    expect(isSupporterTheme("nord")).toBe(true);
    expect(isSupporterTheme("dark")).toBe(false);
  });

  it("validates theme names", () => {
    expect(isThemeName("dark")).toBe(true);
    expect(isThemeName("halftone")).toBe(true);
    expect(isThemeName("nope")).toBe(false);
    expect(isThemeName(42)).toBe(false);
  });
});
