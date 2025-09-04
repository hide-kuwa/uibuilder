import { useEffect, useMemo } from 'react';
import type { ThemeTokens } from './themeTokens';
import { defaultTheme } from './themeTokens';
import { useThemeContext } from './ThemeProvider';

const mergeTheme = (base: ThemeTokens, override?: Partial<ThemeTokens>): ThemeTokens => {
  if (!override) return base;
  return {
    colors: { ...base.colors, ...override.colors },
    radius: { ...base.radius, ...override.radius },
    fontSize: { ...base.fontSize, ...override.fontSize },
  };
};

const resolveTheme = (
  current: ThemeTokens,
  override?: Partial<ThemeTokens>
): ThemeTokens => mergeTheme(current, override);

export const useTheme = (options?: {
  override?: Partial<ThemeTokens>;
  scope?: 'global' | 'local';
}): ThemeTokens => {
  const { theme, setTheme } = useThemeContext();

  useEffect(() => {
    if (options?.override && options.scope === 'global') {
      setTheme(resolveTheme(theme, options.override));
    }
  }, [options?.override, options?.scope, setTheme, theme]);

  return useMemo(() => {
    const merged = resolveTheme(theme, options?.override);
    return mergeTheme(defaultTheme, merged);
  }, [theme, options?.override]);
};

export default useTheme;
