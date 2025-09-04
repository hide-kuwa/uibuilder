'use client';
import React, { useEffect } from 'react';
import minimal from '../../../../src/themes/presets/minimal.json';
import corporate from '../../../../src/themes/presets/corporate.json';
import pop from '../../../../src/themes/presets/pop.json';
import { useUserStore } from '../../../../src/stores/userStore';
import { useThemeStore, type ThemeTokens } from '../../../../src/stores/themeStore';

const presets = [
  { id: 'minimal', name: 'Minimal', tokens: minimal },
  { id: 'corporate', name: 'Corporate', tokens: corporate },
  { id: 'pop', name: 'Pop', tokens: pop },
];

export default function SkinsPage() {
  const { brandThemeId, setBrandThemeId } = useUserStore();

  useEffect(() => {
    useThemeStore.setState((state) => ({
      themes: {
        ...state.themes,
        minimal: minimal as ThemeTokens,
        corporate: corporate as ThemeTokens,
        pop: pop as ThemeTokens,
      },
    }));
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Skins</h1>
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.id}
            className={`btn btn-sm ${brandThemeId === p.id ? 'btn-primary' : ''}`}
            onClick={() => setBrandThemeId(p.id)}
          >
            {p.name}
          </button>
        ))}
        <button
          className={`btn btn-sm ${!brandThemeId ? 'btn-primary' : ''}`}
          onClick={() => setBrandThemeId(undefined)}
        >
          Default
        </button>
      </div>
    </div>
  );
}
