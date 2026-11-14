"use client";
import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_THEME_ID,
  getTheme,
  isThemeAllowed,
  normalizeThemeId,
  THEME_STORAGE_KEY,
  type ThemeConfig,
} from "@pinguin/shared/themes";
import { applyTheme } from "../utils/theme";

interface ThemeState {
  current: string;
  setTheme: (name: string) => boolean;
  isDark: boolean;
  theme: ThemeConfig;
  ready: boolean;
}

interface UseThemeOptions {
  isSupporter?: boolean;
}

function readStoredTheme(): string {
  try {
    return normalizeThemeId(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return DEFAULT_THEME_ID;
  }
}

export function useTheme({
  isSupporter = false,
}: UseThemeOptions = {}): ThemeState {
  const [current, setCurrent] = useState(DEFAULT_THEME_ID);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readStoredTheme();
    setCurrent(isThemeAllowed(stored, isSupporter) ? stored : DEFAULT_THEME_ID);
    setReady(true);
  }, [isSupporter]);

  useEffect(() => {
    if (!ready) return;
    const theme = getTheme(current);
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme.id);
    } catch {
      /* private mode / storage full */
    }
  }, [current, ready]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      const next = normalizeThemeId(event.newValue);
      if (isThemeAllowed(next, isSupporter)) setCurrent(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [isSupporter]);

  const setTheme = useCallback(
    (name: string): boolean => {
      const next = normalizeThemeId(name);
      if (!isThemeAllowed(next, isSupporter)) return false;
      setCurrent(next);
      return true;
    },
    [isSupporter],
  );

  const theme = getTheme(current);

  return {
    current: theme.id,
    setTheme,
    isDark: theme.isDark,
    theme,
    ready,
  };
}
