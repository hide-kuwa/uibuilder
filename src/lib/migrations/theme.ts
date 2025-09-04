import { defaultTheme, type ThemeTokens } from '../../stores/themeStore';
import { themeDocSchema, type ThemeDoc } from '../../schemas/theme';
import { ZodError } from 'zod';

export const THEME_VERSION = 1;

// migrateTheme converts given json (possibly legacy) to latest ThemeDoc.
// It accepts both v1 (current) and legacy unversioned themes.
export function migrateTheme(json: any): ThemeDoc {
  if (!json || typeof json !== 'object') {
    throw new Error('Invalid theme data');
  }
  const v = json.version ?? 0;
  if (v === THEME_VERSION) {
    return parse(json);
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
    return parse({ ...merged, version: THEME_VERSION });
  }
  throw new Error(`Unsupported theme version: ${v}`);
}

function parse(doc: unknown): ThemeDoc {
  try {
    return themeDocSchema.parse(doc);
  } catch (err) {
    if (err instanceof ZodError) {
      const msg = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(msg);
    }
    throw err;
  }
}
