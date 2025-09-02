'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SidebarPreset } from '@/types/sidebar';

const DEFAULTS: SidebarPreset[] = [{
  id: 'auto-default',
  name: 'Auto (all)',
  mode: 'auto+overlay',
  include: [],
  exclude: [],
  overlay: [],
  rootHidden: false,
}];

type State = { presets: SidebarPreset[]; activeId: string; };
type Actions = {
  apply: (id: string) => void;
  upsert: (p: SidebarPreset) => void;
  remove: (id: string) => void;
  active: () => SidebarPreset;
};

export const useSidebarStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      presets: DEFAULTS,
      activeId: DEFAULTS[0].id,
      apply: (id) => set({ activeId: id }),
      upsert: (p) => {
        const list = [...get().presets];
        const i = list.findIndex(x => x.id === p.id);
        if (i >= 0) list[i] = p; else list.push(p);
        set({ presets: list });
      },
      remove: (id) => set({ presets: get().presets.filter(p => p.id !== id) }),
      active: () => get().presets.find(p => p.id === get().activeId)!,
    }),
    { name: 'sidebar-presets' }
  )
);
