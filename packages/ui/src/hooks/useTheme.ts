'use client';
import { useState, useEffect, useCallback } from 'react';
import { THEME_NAME, type ThemeConfig } from '@pinguin/shared';
import { HALFTONE_THEME } from '@pinguin/shared';

interface ThemeState {
  current: string;
  setTheme: (name: string) => void;
  isDark: boolean;
  theme: ThemeConfig;
}

export function useTheme(): ThemeState {
  const [, setCurrent] = useState<string>(THEME_NAME);

  useEffect(() => {
    try {
      localStorage.removeItem('pinguin-theme');
    } catch {
      /* storage unavailable */
    }
  }, []);

  const setTheme = useCallback((name: string) => {
    setCurrent(name);
    try {
      localStorage.setItem('pinguin-theme', name);
    } catch {
      /* storage unavailable */
    }
  }, []);

  return {
    current: THEME_NAME,
    setTheme,
    isDark: true,
    theme: HALFTONE_THEME,
  };
}