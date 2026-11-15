export const DEFAULT_THEME_ID = "classic";

export const THEME_NAME = DEFAULT_THEME_ID;

export const THEME_STORAGE_KEY = "pinguin-theme";
export const SUPPORTER_STORAGE_KEY = "pinguin-supporter";

export type ThemeTier = "free" | "supporter";

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
  id: string;
  name: string;
  label: string;
  description: string;
  tier: ThemeTier;
  isDark: boolean;
  colors: ThemeColors;
}

const defineTheme = (theme: ThemeConfig): ThemeConfig => theme;

export const CLASSIC_THEME = defineTheme({
  id: "classic",
  name: "classic",
  label: "classic",
  description: "the original warm halftone paper. hairline rules, no gloss.",
  tier: "free",
  isDark: true,
  colors: {
    background: "#1b1b19",
    surface: "#0e0e0d",
    surfaceAlt: "#161613",
    border: "rgba(222, 209, 191, 0.2)",
    text: "#ded1bf",
    textSecondary: "#b0a08c",
    accent: "#e08a4c",
    accentHover: "#eda471",
    success: "#a8b39a",
    warning: "#e08a4c",
    error: "#d8b2a2",
    info: "#b0a08c",
    sidebar: "#0d0d0a",
    sidebarActive: "#161613",
    header: "#0d0d0a",
  },
});

const DARK_THEME = defineTheme({
  id: "dark",
  name: "dark",
  label: "dark",
  description: "neutral charcoal with cool ink. softer than pure black.",
  tier: "free",
  isDark: true,
  colors: {
    background: "#17181c",
    surface: "#111216",
    surfaceAlt: "#1d1f25",
    border: "rgba(231, 233, 238, 0.14)",
    text: "#e4e6eb",
    textSecondary: "#9aa0ad",
    accent: "#c3c8d4",
    accentHover: "#d7dbe6",
    success: "#8fbf9f",
    warning: "#d8b46a",
    error: "#e08b8b",
    info: "#8aa4c8",
    sidebar: "#101115",
    sidebarActive: "#1d1f25",
    header: "#101115",
  },
});

const OLED_THEME = defineTheme({
  id: "oled",
  name: "oled",
  label: "oled",
  description: "true black for oled screens. maximum contrast, zero glow.",
  tier: "free",
  isDark: true,
  colors: {
    background: "#000000",
    surface: "#060606",
    surfaceAlt: "#101010",
    border: "rgba(255, 255, 255, 0.14)",
    text: "#f4f4f5",
    textSecondary: "#a1a1aa",
    accent: "#e4e4e7",
    accentHover: "#ffffff",
    success: "#6ee7b7",
    warning: "#fbbf24",
    error: "#f87171",
    info: "#93c5fd",
    sidebar: "#000000",
    sidebarActive: "#101010",
    header: "#000000",
  },
});

const LIGHT_THEME = defineTheme({
  id: "light",
  name: "light",
  label: "light",
  description: "warm cream paper and dark ink. the daylight reading mode.",
  tier: "free",
  isDark: false,
  colors: {
    background: "#f4f0e6",
    surface: "#fbf8f1",
    surfaceAlt: "#ece6da",
    border: "rgba(36, 33, 28, 0.2)",
    text: "#26231e",
    textSecondary: "#6f675c",
    accent: "#a04f1e",
    accentHover: "#8f4519",
    success: "#4f7a4a",
    warning: "#9a6b1f",
    error: "#a33a2f",
    info: "#3f5f7a",
    sidebar: "#ece6da",
    sidebarActive: "#e2dbcd",
    header: "#ece6da",
  },
});

const EVERFOREST_THEME = defineTheme({
  id: "everforest",
  name: "everforest",
  label: "everforest",
  description: "a soft green, low-contrast forest palette.",
  tier: "supporter",
  isDark: true,
  colors: {
    background: "#2d353b",
    surface: "#232a2e",
    surfaceAlt: "#343f44",
    border: "rgba(211, 198, 170, 0.16)",
    text: "#d3c6aa",
    textSecondary: "#9da9a0",
    accent: "#a7c080",
    accentHover: "#b3cc8f",
    success: "#a7c080",
    warning: "#dbbc7f",
    error: "#e67e80",
    info: "#7fbbb3",
    sidebar: "#232a2e",
    sidebarActive: "#343f44",
    header: "#232a2e",
  },
});

const CATPPUCCIN_THEME = defineTheme({
  id: "catppuccin",
  name: "catppuccin",
  label: "catppuccin",
  description: "the community favourite. pastel mocha, easy on the eyes.",
  tier: "supporter",
  isDark: true,
  colors: {
    background: "#1e1e2e",
    surface: "#181825",
    surfaceAlt: "#313244",
    border: "rgba(205, 214, 244, 0.14)",
    text: "#cdd6f4",
    textSecondary: "#a6adc8",
    accent: "#cba6f7",
    accentHover: "#ddb6f8",
    success: "#a6e3a1",
    warning: "#f9e2af",
    error: "#f38ba8",
    info: "#89b4fa",
    sidebar: "#11111b",
    sidebarActive: "#313244",
    header: "#11111b",
  },
});

const DRACULA_THEME = defineTheme({
  id: "dracula",
  name: "dracula",
  label: "dracula",
  description: "purple, pink and cyan on deep slate.",
  tier: "supporter",
  isDark: true,
  colors: {
    background: "#282a36",
    surface: "#21222c",
    surfaceAlt: "#343746",
    border: "rgba(248, 248, 242, 0.14)",
    text: "#f8f8f2",
    textSecondary: "#a4a8b8",
    accent: "#bd93f9",
    accentHover: "#caa8fa",
    success: "#50fa7b",
    warning: "#f1fa8c",
    error: "#ff5555",
    info: "#8be9fd",
    sidebar: "#21222c",
    sidebarActive: "#343746",
    header: "#21222c",
  },
});

const TOKYO_NIGHT_THEME = defineTheme({
  id: "tokyo-night",
  name: "tokyo-night",
  label: "tokyo night",
  description: "deep blue night with calm neon accents.",
  tier: "supporter",
  isDark: true,
  colors: {
    background: "#1a1b26",
    surface: "#16161e",
    surfaceAlt: "#24283b",
    border: "rgba(192, 202, 245, 0.14)",
    text: "#c0caf5",
    textSecondary: "#7a84a8",
    accent: "#7aa2f7",
    accentHover: "#8fb4ff",
    success: "#9ece6a",
    warning: "#e0af68",
    error: "#f7768e",
    info: "#7dcfff",
    sidebar: "#16161e",
    sidebarActive: "#24283b",
    header: "#16161e",
  },
});

const ROSE_PINE_THEME = defineTheme({
  id: "rose-pine",
  name: "rose-pine",
  label: "rose pine",
  description: "muted mauve and pine, a botanical dark theme.",
  tier: "supporter",
  isDark: true,
  colors: {
    background: "#191724",
    surface: "#1f1d2e",
    surfaceAlt: "#26233a",
    border: "rgba(224, 222, 244, 0.14)",
    text: "#e0def4",
    textSecondary: "#908caa",
    accent: "#c4a7e7",
    accentHover: "#d2b8f0",
    success: "#9ccfd8",
    warning: "#f6c177",
    error: "#eb6f92",
    info: "#3e8fb0",
    sidebar: "#1f1d2e",
    sidebarActive: "#26233a",
    header: "#1f1d2e",
  },
});

const GRUVBOX_THEME = defineTheme({
  id: "gruvbox",
  name: "gruvbox",
  label: "gruvbox",
  description: "retro warm browns with bright retro colours.",
  tier: "supporter",
  isDark: true,
  colors: {
    background: "#282828",
    surface: "#1d2021",
    surfaceAlt: "#3c3836",
    border: "rgba(235, 219, 178, 0.16)",
    text: "#ebdbb2",
    textSecondary: "#a89984",
    accent: "#fabd2f",
    accentHover: "#fecc5e",
    success: "#b8bb26",
    warning: "#fabd2f",
    error: "#fb4934",
    info: "#83a598",
    sidebar: "#1d2021",
    sidebarActive: "#3c3836",
    header: "#1d2021",
  },
});

const NORD_THEME = defineTheme({
  id: "nord",
  name: "nord",
  label: "nord",
  description: "arctic, cool blue-grey. quiet and cold.",
  tier: "supporter",
  isDark: true,
  colors: {
    background: "#2e3440",
    surface: "#272c36",
    surfaceAlt: "#3b4252",
    border: "rgba(236, 239, 244, 0.14)",
    text: "#eceff4",
    textSecondary: "#9aa5b8",
    accent: "#88c0d0",
    accentHover: "#9fd0de",
    success: "#a3be8c",
    warning: "#ebcb8b",
    error: "#bf616a",
    info: "#81a1c1",
    sidebar: "#272c36",
    sidebarActive: "#3b4252",
    header: "#272c36",
  },
});

const KANAGAWA_THEME = defineTheme({
  id: "kanagawa",
  name: "kanagawa",
  label: "kanagawa",
  description: "ink-wash dark with wave-blue accents.",
  tier: "supporter",
  isDark: true,
  colors: {
    background: "#1f1f28",
    surface: "#16161d",
    surfaceAlt: "#2a2a37",
    border: "rgba(220, 215, 186, 0.14)",
    text: "#dcd7ba",
    textSecondary: "#938f8a",
    accent: "#7e9cd8",
    accentHover: "#93a9e0",
    success: "#98bb6c",
    warning: "#e6c384",
    error: "#c34043",
    info: "#7fb4ca",
    sidebar: "#16161d",
    sidebarActive: "#2a2a37",
    header: "#16161d",
  },
});

const ONE_DARK_THEME = defineTheme({
  id: "one-dark",
  name: "one-dark",
  label: "one dark",
  description: "the classic atom one dark palette.",
  tier: "supporter",
  isDark: true,
  colors: {
    background: "#282c34",
    surface: "#21252b",
    surfaceAlt: "#333842",
    border: "rgba(171, 178, 191, 0.16)",
    text: "#abb2bf",
    textSecondary: "#7f8796",
    accent: "#61afef",
    accentHover: "#7fc0f5",
    success: "#98c379",
    warning: "#e5c07b",
    error: "#e06c75",
    info: "#56b6c2",
    sidebar: "#21252b",
    sidebarActive: "#333842",
    header: "#21252b",
  },
});

export const FREE_THEMES: ThemeConfig[] = [
  CLASSIC_THEME,
  DARK_THEME,
  OLED_THEME,
  LIGHT_THEME,
];

export const SUPPORTER_THEMES: ThemeConfig[] = [
  EVERFOREST_THEME,
  CATPPUCCIN_THEME,
  DRACULA_THEME,
  TOKYO_NIGHT_THEME,
  ROSE_PINE_THEME,
  GRUVBOX_THEME,
  NORD_THEME,
  KANAGAWA_THEME,
  ONE_DARK_THEME,
];

export const THEME_LIST: ThemeConfig[] = [...FREE_THEMES, ...SUPPORTER_THEMES];

const THEME_MAP = new Map(THEME_LIST.map((theme) => [theme.id, theme]));

const LEGACY_THEME_IDS: Record<string, string> = {
  halftone: "classic",
  classic: "classic",
  dark: "dark",
  oled: "oled",
  light: "light",
};

export function normalizeThemeId(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_THEME_ID;
  const key = value.trim().toLowerCase();
  return LEGACY_THEME_IDS[key] ?? (THEME_MAP.has(key) ? key : DEFAULT_THEME_ID);
}

export function isThemeName(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const key = value.trim().toLowerCase();
  return key in LEGACY_THEME_IDS || THEME_MAP.has(key);
}

export function getTheme(themeName?: string | null): ThemeConfig {
  return THEME_MAP.get(normalizeThemeId(themeName)) ?? CLASSIC_THEME;
}

export function getThemeById(themeId: string): ThemeConfig {
  return getTheme(themeId);
}

export function isThemeAllowed(
  theme: ThemeConfig | string,
  isSupporter: boolean,
): boolean {
  const resolved = typeof theme === "string" ? getTheme(theme) : theme;
  return resolved.tier === "free" || Boolean(isSupporter);
}

export function isSupporterTheme(theme: ThemeConfig | string): boolean {
  return (
    (typeof theme === "string" ? getTheme(theme) : theme).tier === "supporter"
  );
}

export const HALFTONE_THEME = CLASSIC_THEME;

export const THEME_BOOT_SCRIPT = `(function(){try{var raw=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(!raw){return}var id=String(raw).trim().toLowerCase();if(id==='halftone'){id='classic'}var known=${JSON.stringify(
  THEME_LIST.map((theme) => theme.id),
)};if(known.indexOf(id)===-1){return}var supporter=${JSON.stringify(
  SUPPORTER_THEMES.map((theme) => theme.id),
)};if(supporter.indexOf(id)!==-1&&localStorage.getItem(${JSON.stringify(
  SUPPORTER_STORAGE_KEY,
)})!=='1'){id='classic'}var root=document.documentElement;root.setAttribute('data-theme',id);root.style.colorScheme=id==='light'?'light':'dark'}catch(e){}})();`;
