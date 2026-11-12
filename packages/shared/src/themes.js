"use strict";
/**
 * Halftone editorial is a single-palette design system: warm near-black paper,
 * warm cream ink, beige-grey hairlines. There is one theme, so theme lookup
 * always resolves to it and legacy theme names keep working.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HALFTONE_THEME = exports.THEME_NAME = void 0;
exports.getTheme = getTheme;
exports.isThemeName = isThemeName;
exports.THEME_NAME = 'HALFTONE';
exports.HALFTONE_THEME = {
    name: exports.THEME_NAME,
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
function getTheme(_themeName) {
    return exports.HALFTONE_THEME;
}
function isThemeName(value) {
    return typeof value === 'string';
}
//# sourceMappingURL=themes.js.map