'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { create } from 'zustand';
import type { ThemeTokens } from './themeTokens';
import { defaultTheme } from './themeTokens';

export type ThemeState = {
  theme: ThemeTokens;
  setTheme: (tokens: ThemeTokens) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: defaultTheme,
  setTheme: (tokens) => set({ theme: tokens }),
}));

const ThemeContext = createContext<ThemeState | null>(null);

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const state = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    const { colors, radius, fontSize } = state.theme;
    const vars: Record<string, string> = {
      '--color-primary': colors.primary,
      '--color-secondary': colors.secondary,
      '--color-background': colors.background,
      '--color-surface': colors.surface,
      '--color-text': colors.text,
      '--radius-sm': radius.sm,
      '--radius-md': radius.md,
      '--radius-lg': radius.lg,
      '--font-size-sm': fontSize.sm,
      '--font-size-base': fontSize.base,
      '--font-size-lg': fontSize.lg,
      '--font-size-xl': fontSize.xl,
    };

    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [state.theme]);

  return <ThemeContext.Provider value={state}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
};
