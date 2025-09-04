'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StatusConfig, NodeStatus } from '@/types/status'
import { defaultStatusConfig } from '@/types/status'

type BuilderNode = {
  id: string
  title?: string
  prefecture?: string
  position?: { x: number; y: number }
  size?: { w: number; h: number }
  z?: number
  locked?: boolean
  status?: NodeStatus
}

type BuilderState = {
  nodes: Record<string, BuilderNode>
  publishedSnapshot: { nodes: Record<string, BuilderNode>; statusConfig: StatusConfig } | null
  statusConfig: StatusConfig
  usePublishedOnMap: boolean

  updateMany: (patches: Array<Partial<BuilderNode> & { id: string }>) => void
  setNodeStatus: (id: string, status: NodeStatus) => void
  setStatusConfig: (updater: (prev: StatusConfig) => StatusConfig) => void
  publishAll: () => void
  setUsePublishedOnMap: (v: boolean) => void
  getMapNodes: (preview?: boolean) => Record<string, BuilderNode>
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      nodes: {},
      publishedSnapshot: null,
      statusConfig: defaultStatusConfig,
      usePublishedOnMap: true,

      updateMany: (patches) =>
        set((s) => {
          const next = { ...s.nodes }
          for (const p of patches) next[p.id] = { ...(next[p.id] ?? { id: p.id }), ...p }
          return { nodes: next }
        }),

      setNodeStatus: (id, status) =>
        set((s) => ({
          nodes: { ...s.nodes, [id]: { ...(s.nodes[id] ?? { id }), status } },
        })),

      setStatusConfig: (up) => set((s) => ({ statusConfig: up(s.statusConfig) })),

      publishAll: () =>
        set((s) => ({ publishedSnapshot: { nodes: { ...s.nodes }, statusConfig: { ...s.statusConfig } } })),

      setUsePublishedOnMap: (v) => set({ usePublishedOnMap: v }),

      getMapNodes: (preview) => {
        const s = get()
        if (preview === true) return s.nodes
        if (s.usePublishedOnMap && s.publishedSnapshot) return s.publishedSnapshot.nodes
        return s.nodes
      },
    }),
    { name: 'builder-v2' }
  )
)

// 便利：直接 get/set したいとき用
export const builderStore = { getState: useBuilderStore.getState, setState: useBuilderStore.setState }
