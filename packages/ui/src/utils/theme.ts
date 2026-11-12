import type { ThemeConfig } from '@pinguin/shared';

/**
 * The editorial system defines its own tokens in CSS (styles/globals.css).
 * Legacy theme application is kept as a no-op so stored preferences from the
 * previous palette do not repaint the page with an off-system colour.
 */
export function generateThemeCSSVariables(_theme: ThemeConfig): string {
  return '';
}

export function applyTheme(_theme: ThemeConfig): void {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById('theme-variables');
  if (existing) existing.remove();
}