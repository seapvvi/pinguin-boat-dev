import type { ThemeConfig } from "@pinguin/shared/themes";

export function applyTheme(theme: ThemeConfig): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", theme.id);
  root.style.colorScheme = theme.isDark ? "dark" : "light";
}

export function generateThemeCSSVariables(theme: ThemeConfig): string {
  const c = theme.colors;
  const vars: Record<string, string> = {
    "--paper": c.background,
    "--ink": c.text,
    "--ink-dim": c.textSecondary,
    "--ink-bright": theme.isDark ? "#ffffff" : "#000000",
    "--accent-primary": c.accent,
    "--accent-secondary": c.info,
    "--accent-hover": c.accentHover,
    "--line": c.border,
    "--line-soft": c.border,
    "--plate-ground": c.background,
    "--plate-frame": c.surface,
    "--bar": c.header,
    "--bg-surface": c.surface,
    "--bg-surface-alt": c.surfaceAlt,
    "--bg-sidebar": c.sidebar,
    "--bg-sidebar-active": c.sidebarActive,
    "--bg-header": c.header,
    "--text-primary": c.text,
    "--text-secondary": c.textSecondary,
    "--success": c.success,
    "--warning": c.warning,
    "--error": c.error,
    "--info": c.info,
  };

  const body = Object.entries(vars)
    .map(([name, value]) => `${name}:${value}`)
    .join(";");

  return `:root{${body}}`;
}
