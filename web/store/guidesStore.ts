import { create } from 'zustand'

export type Unit = 'px' | '%' | 'rem'
export type Guide = {
  id: string
  axis: 'x' | 'y'   // x=垂直ガイド, y=水平ガイド
  pos: number       // ワールド(px)座標。%やremは変換後にここへ格納
  locked: boolean
  visible: boolean
}

type GuidesState = {
  guides: Guide[]
  /** 全体表示切替 */
  visible: boolean
  /** 全体ロック */
  locked: boolean
  unit: Unit
  baseRemPx: number
  snapPx: number     // 画面(px)でのスナップしきい値
  smartEnabled: boolean
  smartSnapPx?: number
  preview: { axis: 'x'|'y'; pos: number } | null
  addGuide: (g: Omit<Guide, 'id'|'locked'|'visible'> & { id?: string }) => string
  moveGuide: (id: string, pos: number) => void
  removeGuide: (id: string) => void
  clearGuides: () => void
  toggleGuideLock: (id: string) => void
  toggleGuideVisible: (id: string) => void
  setVisible: (v: boolean) => void
  setLocked: (v: boolean) => void
  setUnit: (u: Unit) => void
  setBaseRemPx: (px: number) => void
  setSnapPx: (px: number) => void
  setSmartEnabled: (v: boolean) => void
  setSmartSnapPx: (px?: number) => void
  setPreview: (g: { axis: 'x'|'y'; pos: number } | null) => void
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
  smartEnabled: true,
  smartSnapPx: undefined,
  preview: null,

  addGuide: (g) => {
    const id = g.id ?? uid()
    set((s) => ({
      guides: [
        ...s.guides,
        { id, axis: g.axis, pos: g.pos, locked: false, visible: true },
      ],
    }))
    return id
  },

  moveGuide: (id, pos) => {
    if (get().locked) return
    set((s) => ({
      guides: s.guides.map((gg) =>
        gg.id === id ? (gg.locked ? gg : { ...gg, pos }) : gg,
      ),
    }))
  },

  removeGuide: (id) =>
    set((s) => ({ guides: s.guides.filter((g) => g.id !== id || g.locked) })),

  clearGuides: () => set({ guides: [] }),

  toggleGuideLock: (id) =>
    set((s) => ({
      guides: s.guides.map((g) =>
        g.id === id ? { ...g, locked: !g.locked } : g,
      ),
    })),

  toggleGuideVisible: (id) =>
    set((s) => ({
      guides: s.guides.map((g) =>
        g.id === id ? { ...g, visible: !g.visible } : g,
      ),
    })),

  setVisible: (v) => set({ visible: v }),
  setLocked: (v) => set({ locked: v }),
  setUnit: (u) => set({ unit: u }),
  setBaseRemPx: (px) => set({ baseRemPx: px }),
  setSnapPx: (px) => set({ snapPx: px }),
  setSmartEnabled: (v) => set({ smartEnabled: v }),
  setSmartSnapPx: (px) => set({ smartSnapPx: px }),
  setPreview: (g) => set({ preview: g }),
}))
