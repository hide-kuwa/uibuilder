import { create } from 'zustand'

export type Unit = 'px' | '%' | 'rem'
export type Guide = {
  id: string
  axis: 'x' | 'y'   // x=垂直ガイド, y=水平ガイド
  pos: number       // ワールド(px)座標。%やremは変換後にここへ格納
}

type GuidesState = {
  guides: Guide[]
  visible: boolean
  locked: boolean
  unit: Unit
  baseRemPx: number
  snapPx: number     // 画面(px)でのスナップしきい値
  addGuide: (g: Omit<Guide, 'id'> & { id?: string }) => string
  moveGuide: (id: string, pos: number) => void
  removeGuide: (id: string) => void
  clearGuides: () => void
  setVisible: (v: boolean) => void
  setLocked: (v: boolean) => void
  setUnit: (u: Unit) => void
  setBaseRemPx: (px: number) => void
  setSnapPx: (px: number) => void
}

const uid = () => Math.random().toString(36).slice(2, 9)

export const useGuidesStore = create<GuidesState>((set, get) => ({
  guides: [
    // 例: 初期ガイド（必要なければ空配列でOK）
    // { id: uid(), axis: 'x', pos: 0 },
    // { id: uid(), axis: 'y', pos: 0 },
  ],
  visible: true,
  locked: false,
  unit: 'px',
  baseRemPx: 16,
  snapPx: 6,

  addGuide: (g) => {
    const id = g.id ?? uid()
    set((s) => ({ guides: [...s.guides, { id, axis: g.axis, pos: g.pos }] }))
    return id
  },

  moveGuide: (id, pos) => {
    if (get().locked) return
    set((s) => ({
      guides: s.guides.map((gg) => (gg.id === id ? { ...gg, pos } : gg)),
    }))
  },

  removeGuide: (id) =>
    set((s) => ({ guides: s.guides.filter((g) => g.id !== id) })),

  clearGuides: () => set({ guides: [] }),

  setVisible: (v) => set({ visible: v }),
  setLocked: (v) => set({ locked: v }),
  setUnit: (u) => set({ unit: u }),
  setBaseRemPx: (px) => set({ baseRemPx: px }),
  setSnapPx: (px) => set({ snapPx: px }),
}))
