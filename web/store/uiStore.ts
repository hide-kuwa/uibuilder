'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UIState = {
  showRulers: boolean;
};
type UIActions = {
  toggleRulers: () => void;
  setRulers: (v: boolean) => void;
};

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set, get) => ({
      showRulers: true, // 既定で表示
      toggleRulers: () => set({ showRulers: !get().showRulers }),
      setRulers: (v) => set({ showRulers: v }),
    }),
    { name: 'builder-ui' }
  )
);
