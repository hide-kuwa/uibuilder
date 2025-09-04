import { create } from 'zustand'

export type Role = 'owner' | 'manager' | 'accountant' | 'viewer'

export type FeatureKey = 'dashboard' | 'reports'

export type PermissionTable = Record<Role, Record<FeatureKey, boolean>>

export interface RbacState {
  role: Role
  permissions: PermissionTable
  locks: Record<FeatureKey, boolean>
  setRole: (role: Role) => void
  setPermission: (role: Role, key: FeatureKey, allowed: boolean) => void
  setLock: (key: FeatureKey, unlocked: boolean) => void
}

const defaultPermissions: PermissionTable = {
  owner: { dashboard: true, reports: true },
  manager: { dashboard: true, reports: false },
  accountant: { dashboard: false, reports: true },
  viewer: { dashboard: false, reports: false },
}

const defaultLocks: Record<FeatureKey, boolean> = {
  dashboard: true,
  reports: false,
}

export const useRbacStore = create<RbacState>((set) => ({
  role: 'viewer',
  permissions: defaultPermissions,
  locks: defaultLocks,
  setRole: (role) => set({ role }),
  setPermission: (role, key, allowed) =>
    set((state) => ({
      permissions: {
        ...state.permissions,
        [role]: { ...state.permissions[role], [key]: allowed },
      },
    })),
  setLock: (key, unlocked) =>
    set((state) => ({
      locks: { ...state.locks, [key]: unlocked },
    })),
}))

export const FEATURE_KEYS = Object.keys(defaultLocks) as FeatureKey[]
