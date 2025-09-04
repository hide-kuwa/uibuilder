'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type XY = { x: number; y: number }
export type Size = { w: number; h: number }

type CanvasState = {
  scale: number
  tx: number
  ty: number
  nodePos: Record<string, XY>
  nodeSize: Record<string, Size>

  // 選択
  selectedIds: string[]
  setSelectedIds: (ids: string[]) => void
  toggleSelect: (id: string, multi?: boolean) => void
  clearSelection: () => void

  // グループ
  groups: Record<string, string[]>
  memberOf: Record<string, string | undefined>
  createGroup: (ids: string[]) => string
  ungroup: (groupId: string) => void
  getGroupMembers: (nodeId: string) => string[]
  groupSelectEnabled: boolean
  setGroupSelectEnabled: (v: boolean) => void

  // スナップ
  snapEnabled: boolean
  gridSize: number
  snapThreshold: number

  // ガイド線（ワールド座標）
  guidesV: number[]   // 縦線 x 座標
  guidesH: number[]   // 横線 y 座標
  setGuides: (vxs: number[], hys: number[]) => void
  clearGuides: () => void

  setTransform: (p: Partial<Pick<CanvasState, 'scale' | 'tx' | 'ty'>>) => void
  setNodePos: (id: string, xy: XY) => void
  moveNodes: (ids: string[], dx: number, dy: number) => void
  setNodeSize: (id: string, sz: Size) => void
  resetView: () => void
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      scale: 1, tx: 0, ty: 0,
      nodePos: {},
      nodeSize: {},

      selectedIds: [],
      setSelectedIds: (ids) => set({ selectedIds: ids }),
      toggleSelect: (id, multi) => {
        const cur = get().selectedIds
        const has = cur.includes(id)
        set({ selectedIds: multi ? (has ? cur.filter(x=>x!==id) : [...cur,id]) : (has ? [] : [id]) })
      },
      clearSelection: () => set({ selectedIds: [] }),

      groups: {},
      memberOf: {},
      groupSelectEnabled: true,
      setGroupSelectEnabled: (v) => set({ groupSelectEnabled: v }),
      createGroup: (ids) => {
        const gid = `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`
        const groups = { ...get().groups, [gid]: Array.from(new Set(ids)) }
        const memberOf = { ...get().memberOf }
        for (const id of ids) memberOf[id] = gid
        set({ groups, memberOf })
        return gid
      },
      ungroup: (groupId) => {
        const groups = { ...get().groups }
        const members = groups[groupId] ?? []
        delete groups[groupId]
        const memberOf = { ...get().memberOf }
        for (const m of members) if (memberOf[m] === groupId) delete memberOf[m]
        set({ groups, memberOf })
      },
      getGroupMembers: (nodeId) => {
        const gid = get().memberOf[nodeId]
        if (!gid) return [nodeId]
        return get().groups[gid] ?? [nodeId]
      },

      snapEnabled: true,
      gridSize: 20,
      snapThreshold: 6,

      guidesV: [],
      guidesH: [],
      setGuides: (vxs, hys) => set({ guidesV: vxs, guidesH: hys }),
      clearGuides: () => set({ guidesV: [], guidesH: [] }),

      setTransform: (p) => set({ ...get(), ...p }),
      setNodePos: (id, xy) => set({ nodePos: { ...get().nodePos, [id]: xy } }),
      moveNodes: (ids, dx, dy) => {
        const next = { ...get().nodePos }
        for (const id of ids) {
          const cur = next[id] ?? { x: 0, y: 0 }
          next[id] = { x: cur.x + dx, y: cur.y + dy }
        }
        set({ nodePos: next })
      },
      setNodeSize: (id, sz) => set({ nodeSize: { ...get().nodeSize, [id]: sz } }),
      resetView: () => set({ scale: 1, tx: 0, ty: 0 }),
    }),
    { name: 'geokore-canvas-v5' }
  )
)
