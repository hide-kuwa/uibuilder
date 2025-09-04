import { useEffect, useMemo } from 'react';
import type { ThemeTokens } from './themeTokens';
import { defaultTheme } from './themeTokens';
import { useThemeContext } from './ThemeProvider';
import { usePageStore } from '@/store/pageStore';

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
  const pageTheme = usePageStore((s) => {
    const p = s.pages.find((p) => p.id === s.currentPageId);
    return p?.pageOverrides?.theme;
  });

  useEffect(() => {
    if (options?.override && options.scope === 'global') {
      setTheme(resolveTheme(theme, options.override));
    }
  }, [options?.override, options?.scope, setTheme, theme]);

  return useMemo(() => {
    const withLayout = mergeTheme(defaultTheme, theme);
    const withPage = mergeTheme(withLayout, pageTheme);
    return mergeTheme(withPage, options?.override);
  }, [theme, pageTheme, options?.override]);
};

export default useTheme;
