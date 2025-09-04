'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  userId: string;
  brandThemeId?: string;
  setUserId: (id: string) => void;
  setBrandThemeId: (id?: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: '',
      brandThemeId: undefined,
      setUserId: (userId) => set({ userId }),
      setBrandThemeId: (brandThemeId) => set({ brandThemeId }),
    }),
    { name: 'user-settings' }
  )
);
