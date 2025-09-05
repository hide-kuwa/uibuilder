'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BuilderLayout = {
  left: string;
  right: string;
  top?: string;
  bottom?: string;
};

type BuilderLayoutState = {
  builderLayout: BuilderLayout;
  setBuilderLayout: (layout: BuilderLayout) => void;
};

const defaultLayout: BuilderLayout = {
  left: 'palette',
  right: 'inspector',
  top: 'toolbar',
};

export const useBuilderLayoutStore = create<BuilderLayoutState>()(
  persist(
    (set) => ({
      builderLayout: defaultLayout,
      setBuilderLayout: (layout) => set({ builderLayout: layout }),
    }),
    { name: 'builder-layout' }
  )
);

