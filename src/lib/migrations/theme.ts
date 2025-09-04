import { defaultTheme, type ThemeTokens } from '../../stores/themeStore';

export const THEME_VERSION = 1;

export interface ThemeDoc extends ThemeTokens {
  version: number;
}

// migrateTheme converts given json (possibly legacy) to latest ThemeDoc.
// It accepts both v1 (current) and legacy unversioned themes.
export function migrateTheme(json: any): ThemeDoc {
  if (!json || typeof json !== 'object') {
    throw new Error('Invalid theme data');
  }
  const v = json.version ?? 0;
  if (v === THEME_VERSION) {
    return json as ThemeDoc;
  }
  if (v === 0) {
    const merged: ThemeTokens = {
      ...defaultTheme,
      ...json,
      colors: { ...defaultTheme.colors, ...(json.colors || {}) },
      radius: { ...defaultTheme.radius, ...(json.radius || {}) },
      spacing: { ...defaultTheme.spacing, ...(json.spacing || {}) },
      typography: { ...defaultTheme.typography, ...(json.typography || {}) },
    };
    return { ...merged, version: THEME_VERSION };
  }
  throw new Error(`Unsupported theme version: ${v}`);
}
