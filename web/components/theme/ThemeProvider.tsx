'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useThemeStore, type ThemeTokens } from '@/stores/themeStore';

export type ThemeContextValue = {
  themeId: string;
  themeTokens: ThemeTokens;
};

const ThemeContext = createContext<ThemeContextValue>({
  themeId: '',
  themeTokens: { color: {}, radius: {}, spacing: {}, font: {} },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeId = useThemeStore((s) => s.themeId);
  const tokens = useThemeStore((s) => s.themeTokens);

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(tokens.color).forEach(([k, v]) => root.style.setProperty(`--color-${k}`, v));
    Object.entries(tokens.radius).forEach(([k, v]) => root.style.setProperty(`--radius-${k}`, `${v}px`));
    Object.entries(tokens.spacing).forEach(([k, v]) => root.style.setProperty(`--spacing-${k}`, `${v}px`));
    Object.entries(tokens.font).forEach(([k, v]) => root.style.setProperty(`--font-${k}`, v));
    if (tokens.color.accent) {
      root.style.setProperty('--focus-ring-color', tokens.color.accent);
    }
    root.style.setProperty('--focus-ring-offset', '2px');
  }, [tokens]);

  return (
    <ThemeContext.Provider value={{ themeId, themeTokens: tokens }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
