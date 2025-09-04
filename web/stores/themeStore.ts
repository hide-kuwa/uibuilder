'use client';

import { create } from 'zustand';

export type ThemeTokens = {
  color: Record<string, string>;
  radius: Record<string, number>;
  spacing: Record<string, number>;
  font: Record<string, string>;
};

export type ThemeState = {
  themeId: string;
  themeTokens: ThemeTokens;
  setTheme: (id: string) => void;
  applyUserSkin: (tokens: Partial<ThemeTokens>) => void;
};

const THEMES: Record<string, ThemeTokens> = {
  geokore: {
    color: { primary: '#2563eb' },
    radius: { sm: 4, md: 8 },
    spacing: { md: 8, lg: 16 },
    font: { base: 'Inter, sans-serif' },
  },
  tamadigi: {
    color: { primary: '#7c3aed' },
    radius: { sm: 6, md: 12 },
    spacing: { md: 10, lg: 20 },
    font: { base: 'Noto Sans JP, sans-serif' },
  },
  tamalogi: {
    color: { primary: '#059669' },
    radius: { sm: 2, md: 4 },
    spacing: { md: 6, lg: 12 },
    font: { base: 'Roboto, sans-serif' },
  },
};

function detectInitialTheme(): string {
  if (typeof window === 'undefined') return 'geokore';
  const host = window.location.hostname;
  if (host.includes('tamadigi')) return 'tamadigi';
  if (host.includes('tamalogi')) return 'tamalogi';
  return 'geokore';
}

export const useThemeStore = create<ThemeState>((set) => {
  const id = detectInitialTheme();
  return {
    themeId: id,
    themeTokens: THEMES[id],
    setTheme: (nextId) => {
      const tokens = THEMES[nextId] ?? THEMES.geokore;
      set({ themeId: nextId, themeTokens: tokens });
    },
    applyUserSkin: (tokens) =>
      set((s) => ({
        themeTokens: {
          color: { ...s.themeTokens.color, ...tokens.color },
          radius: { ...s.themeTokens.radius, ...tokens.radius },
          spacing: { ...s.themeTokens.spacing, ...tokens.spacing },
          font: { ...s.themeTokens.font, ...tokens.font },
        },
      })),
  };
});
