'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UIPreset } from '@/types/presets';

const DEFAULTS: UIPreset[] = [
  {
    id: 'all',
    name: 'All Components',
    palette: { groups: [], include: [], exclude: [] }, // 全表示（Palette側で解釈）
    chrome: { header: true, footer: true },
  },
  {
    id: 'travel',
    name: 'Travel (Maps only)',
    palette: { groups: ['Maps'], include: [], exclude: [] },
    chrome: { header: true, footer: true },
  },
  {
    id: 'builder-focus',
    name: 'Builder Focus (no chrome)',
    palette: { groups: [], include: [], exclude: [] },
    chrome: { header: false, footer: false },
  },
];

type State = {
  presets: UIPreset[];
  activeId: string;                 // 現在のプリセット
};
type Actions = {
  apply: (id: string) => void;
  upsert: (p: UIPreset) => void;
  remove: (id: string) => void;
  active: () => UIPreset;
};

export const usePresetStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      presets: DEFAULTS,
      activeId: DEFAULTS[0].id,
      apply: (id) => set({ activeId: id }),
      upsert: (p) => {
        const list = get().presets;
        const i = list.findIndex(x => x.id === p.id);
        if (i >= 0) list[i] = p; else list.push(p);
        set({ presets: [...list] });
      },
      remove: (id) => set({ presets: get().presets.filter(p => p.id !== id) }),
      active: () => get().presets.find(p => p.id === get().activeId)!,
    }),
    { name: 'ui-presets' }
  )
);
