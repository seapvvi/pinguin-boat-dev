/**
 * Halftone editorial is a single-palette design system: warm near-black paper,
 * warm cream ink, beige-grey hairlines. There is one theme, so theme lookup
 * always resolves to it and legacy theme names keep working.
 */

export const THEME_NAME = 'HALFTONE' as const;

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentHover: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  sidebar: string;
  sidebarActive: string;
  header: string;
}

export interface ThemeConfig {
  name: string;
  label: string;
  colors: ThemeColors;
  isDark: boolean;
}

export const HALFTONE_THEME: ThemeConfig = {
  name: THEME_NAME,
  label: 'halftone',
  colors: {
    background: '#1b1b19',
    surface: '#0e0e0d',
    surfaceAlt: '#161613',
    border: 'rgba(212, 197, 181, 0.16)',
    text: '#d4c5b5',
    textSecondary: '#9f8f7f',
    accent: '#cdc4ba',
    accentHover: '#bfa98a',
    success: '#a8b39a',
    warning: '#bfa98a',
    error: '#d8b2a2',
    info: '#9f8f7f',
    sidebar: '#0d0d0a',
    sidebarActive: '#161613',
    header: '#0d0d0a',
  },
  isDark: true,
};

export function getTheme(_themeName?: string | null): ThemeConfig {
  return HALFTONE_THEME;
}

export function isThemeName(value: unknown): boolean {
  return typeof value === 'string';
}