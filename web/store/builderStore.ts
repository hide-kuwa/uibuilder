'use client'
import { create } from 'zustand'
import { produce, produceWithPatches } from 'immer'
import type { DocgenMetaItem } from '@/lib/builder/docgen'
import { parseValue } from '@/lib/builder/docgen'
import { registry, type RegistryKey } from '@/lib/registry'
import { useGridStore } from '@/store/gridStore'
import { useHistoryStore } from './historyStore'

export type ElmType = RegistryKey | 'code'

export type Elm = {
  id: string
  type: ElmType
  x: number
  y: number
  w: number
  h: number
  visible?: boolean
  locked?: boolean
  parentId?: string | null
  children?: string[]
  name?: string
  props?: {
    text?: string
    color?: string
    bg?: string
    align?: 'left' | 'center' | 'right'
    presetId?: string | null
    presetIds?: string[]
    loginButton?: {
      enabled: boolean
      label: string
      variant: 'solid' | 'outline'
      href?: string
    }
  }
  code?: {
    displayName: string
    importPath: string
    exportName?: string
    props: Record<string, unknown>
  }
}

export type ElmPatch = { id: string; x?: number; y?: number; w?: number; h?: number; props?: any }

type BuilderState = {
  elements: Elm[]
  selectedId: string | null
  selectedIds: string[]
  ui: {
    dragDraft?: { id: string; rect: { x: number; y: number; w: number; h: number } }
    guides: Array<{ axis: 'x' | 'y'; pos: number }>
  }
  historyBatchDepth: number
}

type BuilderActions = {
  addFromPalette: (
    type: ElmType,
    at?: { x: number; y: number },
    meta?: DocgenMetaItem,
  ) => void
  move: (id: string, to: { x: number; y: number }, snapGrid?: boolean) => void
  resize: (id: string, to: { w: number; h: number }, snapGrid?: boolean) => void
  setDragDraft: (
    d?: { id: string; rect: { x: number; y: number; w: number; h: number } },
  ) => void
  setGuides: (lines: Array<{ axis: 'x' | 'y'; pos: number }>) => void
  clearGuides: () => void
  select: (id: string | string[] | null) => void
  addSelect: (id: string | string[]) => void
  removeSelect: (id: string | string[]) => void
  toggleSelect: (id: string | string[]) => void
  align: (
    kind:
      | 'left'
      | 'centerX'
      | 'right'
      | 'top'
      | 'centerY'
      | 'bottom'
      | 'hSpace'
      | 'vSpace',
  ) => void
  updateProps: (
    id: string,
    patch: Partial<Elm['props']> & { code?: Partial<Elm['code']> },
  ) => void
  reorder: (idsInOrder: string[]) => void
  reorderWithinParent: (parentId: string | null, orderedIds: string[]) => void
  setVisible: (id: string, v: boolean) => void
  setLocked: (id: string, v: boolean) => void
  rename: (id: string, name: string) => void
  group: (ids: string[], opts?: { name?: string }) => string
  ungroup: (id: string) => void
  deleteSelected: () => void
  bringToFront: (id: string) => void
  sendToBack: (id: string) => void
  nudge: (dx: number, dy: number) => void
  setElements: (els: Elm[]) => void
  serialize: () => string
  hydrate: (json: string) => void
  undo: () => void
  redo: () => void
  beginBatch: () => void
  endBatch: () => void
  updateMany: (patches: ElmPatch[], recordHistory?: boolean) => void
}

function snapToGrid(n: number) {
  const size = useGridStore.getState().size
  return Math.round(n / size) * size
}

function defaultSize(type: ElmType): { w: number; h: number; text?: string } {
  if (type === 'code') return { w: 160, h: 40 }
  const entry = (registry as any)[type]
  const size = entry?.meta?.defaultSize ?? { w: 320, h: 200 }
  const text = entry?.meta?.displayName
  return { ...size, text }
}

export const useBuilderStore = create<BuilderState & BuilderActions>((set, get) => {
  const apply = (recipe: (draft: BuilderState) => void) => {
    set((state) => {
      const [next, patches, inverse] = produceWithPatches(state, recipe)
      useHistoryStore.getState().push(patches, inverse)
      return next
    })
  }

  return {
    elements: [],
    selectedId: null,
    selectedIds: [],
    ui: { guides: [] },
    historyBatchDepth: 0,

  addFromPalette(type, at, meta) {
    const id = `elm_${Date.now().toString(36)}`
    const { w, h, text } = defaultSize(type)
    const snapState = useGridStore.getState()
    const x = snapState.snap ? snapToGrid(at?.x ?? 40) : at?.x ?? 40
    const y = snapState.snap ? snapToGrid(at?.y ?? 40) : at?.y ?? 40
    apply((draft: BuilderState) => {
      if (type === 'code') {
        const initProps: Record<string, unknown> = {}
        meta?.props?.forEach((p) => {
          const v = parseValue(p.defaultValue?.value)
          if (v !== undefined) initProps[p.name] = v
        })
        draft.elements.push({
          id,
          type,
          x,
          y,
          w,
          h,
          visible: true,
          locked: false,
          parentId: null,
          name: meta?.displayName ?? 'Component',
          children: [],
          code: {
            displayName: meta?.displayName ?? 'Component',
            importPath: meta?.importPath ?? '',
            exportName: meta?.exportName,
            props: initProps,
          },
        })
      } else {
        draft.elements.push({
          id,
          type,
          x,
          y,
          w,
          h,
          visible: true,
          locked: false,
          parentId: null,
          name: type.charAt(0).toUpperCase() + type.slice(1),
          children: [],
          props: {
            text,
            bg: type === 'button' ? '#0ea5e9' : '#111827',
            color: '#e5e7eb',
          },
        })
      }
      draft.selectedId = id
      draft.selectedIds = [id]
    })
  },

  move(id, to, snapGrid = true) {
    apply((draft: BuilderState) => {
      const updateParent = (child: Elm) => {
        if (!child.parentId) return
        const parent = draft.elements.find((x) => x.id === child.parentId)
        if (!parent || !parent.children) return
        const kids = parent.children
          .map((cid) => draft.elements.find((x) => x.id === cid))
          .filter(Boolean) as Elm[]
        const x1 = Math.min(...kids.map((k) => k.x))
        const y1 = Math.min(...kids.map((k) => k.y))
        const x2 = Math.max(...kids.map((k) => k.x + k.w))
        const y2 = Math.max(...kids.map((k) => k.y + k.h))
        parent.x = x1
        parent.y = y1
        parent.w = x2 - x1
        parent.h = y2 - y1
        updateParent(parent)
      }
      const e = draft.elements.find((x) => x.id === id)
      if (!e || e.locked) return
      const { snap } = useGridStore.getState()
      const nx = snapGrid && snap ? snapToGrid(to.x) : to.x
      const ny = snapGrid && snap ? snapToGrid(to.y) : to.y
      const dx = nx - e.x
      const dy = ny - e.y
      e.x = nx
      e.y = ny
      if (e.children) {
        e.children.forEach((cid) => {
          const c = draft.elements.find((x) => x.id === cid)
          if (c) {
            c.x += dx
            c.y += dy
            updateParent(c)
          }
        })
      } else {
        updateParent(e)
      }
    })
  },

  resize(id, to, snapGrid = true) {
    apply((draft: BuilderState) => {
      const e = draft.elements.find((x) => x.id === id)
      if (!e || e.locked || (e.children && e.children.length)) return
      const { snap } = useGridStore.getState()
      e.w = Math.max(16, snapGrid && snap ? snapToGrid(to.w) : to.w)
      e.h = Math.max(16, snapGrid && snap ? snapToGrid(to.h) : to.h)
    })
  },

  setDragDraft(d) {
    set(
      produce((draft: BuilderState) => {
        draft.ui.dragDraft = d
      }),
    )
  },

  setGuides(lines) {
    set(
      produce((draft: BuilderState) => {
        draft.ui.guides = lines
      }),
    )
  },

  clearGuides() {
    set(
      produce((draft: BuilderState) => {
        draft.ui.guides = []
      }),
    )
  },

  select(id) {
    if (Array.isArray(id)) {
      set({ selectedId: id[id.length - 1] ?? null, selectedIds: id })
    } else {
      set({ selectedId: id, selectedIds: id ? [id] : [] })
    }
  },

  addSelect(id) {
    const ids = Array.isArray(id) ? id : [id]
    set(
      produce((draft: BuilderState) => {
        ids.forEach((i) => {
          if (!draft.selectedIds.includes(i)) draft.selectedIds.push(i)
        })
        draft.selectedId = draft.selectedIds[draft.selectedIds.length - 1] ?? null
      }),
    )
  },

  removeSelect(id) {
    const ids = Array.isArray(id) ? id : [id]
    set(
      produce((draft: BuilderState) => {
        draft.selectedIds = draft.selectedIds.filter((i) => !ids.includes(i))
        draft.selectedId =
          draft.selectedIds[draft.selectedIds.length - 1] ?? null
      }),
    )
  },

  toggleSelect(id) {
    const ids = Array.isArray(id) ? id : [id]
    set(
      produce((draft: BuilderState) => {
        ids.forEach((i) => {
          const idx = draft.selectedIds.indexOf(i)
          if (idx >= 0) draft.selectedIds.splice(idx, 1)
          else draft.selectedIds.push(i)
        })
        draft.selectedId = draft.selectedIds[draft.selectedIds.length - 1] ?? null
      }),
    )
  },

  align(kind) {
    const ids = get().selectedIds
    const els = get().elements.filter((e) => ids.includes(e.id) && e.visible !== false)
    if (els.length < 2) return
    const x1 = Math.min(...els.map((e) => e.x))
    const y1 = Math.min(...els.map((e) => e.y))
    const x2 = Math.max(...els.map((e) => e.x + e.w))
    const y2 = Math.max(...els.map((e) => e.y + e.h))
    apply((draft: BuilderState) => {
      const targets = draft.elements.filter(
        (e) => ids.includes(e.id) && e.visible !== false,
      )
      switch (kind) {
        case 'left':
          targets.forEach((e) => {
            e.x = x1
          })
          break
        case 'centerX': {
          const cx = (x1 + x2) / 2
          targets.forEach((e) => {
            e.x = Math.round(cx - e.w / 2)
          })
          break
        }
        case 'right':
          targets.forEach((e) => {
            e.x = x2 - e.w
          })
          break
        case 'top':
          targets.forEach((e) => {
            e.y = y1
          })
          break
        case 'centerY': {
          const cy = (y1 + y2) / 2
          targets.forEach((e) => {
            e.y = Math.round(cy - e.h / 2)
          })
          break
        }
        case 'bottom':
          targets.forEach((e) => {
            e.y = y2 - e.h
          })
          break
        case 'hSpace': {
          const sorted = [...targets].sort((a, b) => a.x - b.x)
          const min = sorted[0].x
          const max = sorted[sorted.length - 1].x + sorted[sorted.length - 1].w
          const total = sorted.reduce((s, e) => s + e.w, 0)
          const gap =
            sorted.length > 1 ? Math.round((max - min - total) / (sorted.length - 1)) : 0
          let cur = min
          sorted.forEach((e) => {
            e.x = cur
            cur += e.w + gap
          })
          break
        }
        case 'vSpace': {
          const sorted = [...targets].sort((a, b) => a.y - b.y)
          const min = sorted[0].y
          const max = sorted[sorted.length - 1].y + sorted[sorted.length - 1].h
          const total = sorted.reduce((s, e) => s + e.h, 0)
          const gap =
            sorted.length > 1 ? Math.round((max - min - total) / (sorted.length - 1)) : 0
          let cur = min
          sorted.forEach((e) => {
            e.y = cur
            cur += e.h + gap
          })
          break
        }
      }
    })
  },

  updateProps(id, patch) {
    apply((draft: BuilderState) => {
      const e = draft.elements.find((x) => x.id === id)
      if (!e) return
      const { code, ...rest } = patch as any
      if (Object.keys(rest).length) {
        e.props = { ...(e.props ?? {}), ...rest }
      }
      if (code) {
        e.code = {
          ...(e.code ?? { displayName: '', importPath: '', props: {} }),
          ...code,
          props: {
            ...(e.code?.props ?? {}),
            ...(code.props ?? {}),
          },
        }
      }
    })
  },

  reorder(idsInOrder) {
    apply((draft: BuilderState) => {
      const map = new Map(idsInOrder.map((id, i) => [id, i]))
      draft.elements.sort((a, b) => {
        const ai = map.get(a.id) ?? Number.MAX_SAFE_INTEGER
        const bi = map.get(b.id) ?? Number.MAX_SAFE_INTEGER
        return ai - bi
      })
    })
  },

  reorderWithinParent(parentId, orderedIds) {
    apply((draft: BuilderState) => {
      const siblings = draft.elements.filter(
        (e) => (e.parentId ?? null) === (parentId ?? null),
      )
      const idSet = new Set(orderedIds)
      const others = siblings.filter((e) => !idSet.has(e.id)).map((e) => e.id)
      const newOrder = [...orderedIds, ...others]
      draft.elements = [
        ...draft.elements.filter((e) => (e.parentId ?? null) !== (parentId ?? null)),
        ...newOrder
          .map((id) => draft.elements.find((e) => e.id === id)!)
          .filter(Boolean),
      ]
      if (parentId) {
        const parent = draft.elements.find((e) => e.id === parentId)
        if (parent) {
          const rest = (parent.children || []).filter((id) => !idSet.has(id))
          parent.children = [...orderedIds, ...rest]
        }
      }
    })
  },

  setVisible(id, v) {
    apply((draft: BuilderState) => {
      const e = draft.elements.find((x) => x.id === id)
      if (e) e.visible = v
    })
  },

  setLocked(id, v) {
    apply((draft: BuilderState) => {
      const e = draft.elements.find((x) => x.id === id)
      if (e) e.locked = v
    })
  },

  rename(id, name) {
    apply((draft: BuilderState) => {
      const e = draft.elements.find((x) => x.id === id)
      if (e) e.name = name
    })
  },

  group(ids, opts) {
    let result = ''
    apply((draft: BuilderState) => {
      const siblings = draft.elements.filter((e) => ids.includes(e.id))
      if (siblings.length < 2) return
      const parentId = siblings[0]?.parentId ?? null
      if (!siblings.every((e) => (e.parentId ?? null) === parentId)) return
      const x1 = Math.min(...siblings.map((e) => e.x))
      const y1 = Math.min(...siblings.map((e) => e.y))
      const x2 = Math.max(...siblings.map((e) => e.x + e.w))
      const y2 = Math.max(...siblings.map((e) => e.y + e.h))
      const id = `grp_${Date.now().toString(36)}`
      const groupElm: Elm = {
        id,
        type: 'group',
        x: x1,
        y: y1,
        w: x2 - x1,
        h: y2 - y1,
        parentId,
        children: ids.slice(),
        visible: true,
        locked: false,
        name: opts?.name ?? 'Group',
      }
      const next = draft.elements.map((el) =>
        ids.includes(el.id) ? { ...el, parentId: id } : el,
      )
      if (parentId) {
        const parent = next.find((e) => e.id === parentId)
        if (parent) {
          const cur = parent.children ?? []
          const firstIndex = Math.min(
            ...ids.map((cid) => cur.indexOf(cid)).filter((i) => i >= 0),
          )
          parent.children = cur.filter((cid) => !ids.includes(cid))
          parent.children.splice(firstIndex, 0, id)
        }
      }
      const order = next
        .filter((e) => (e.parentId ?? null) === parentId)
        .map((e) => e.id)
      const firstIndex = Math.min(
        ...ids.map((cid) => order.indexOf(cid)).filter((i) => i >= 0),
      )
      order.splice(firstIndex, 0, id)
      draft.elements = [
        ...next.filter((e) => (e.parentId ?? null) !== parentId),
        ...order
          .map((eid) => (eid === id ? groupElm : next.find((e) => e.id === eid)!))
          .filter(Boolean),
      ]
      draft.selectedId = id
      draft.selectedIds = [id]
      result = id
    })
    return result
  },

  ungroup(id) {
    apply((draft: BuilderState) => {
      const g = draft.elements.find((e) => e.id === id && e.type === 'group')
      if (!g) return
      const parentId = g.parentId ?? null
      const kids = draft.elements.filter((e) => e.parentId === g.id)
      kids.forEach((k) => (k.parentId = parentId))
      const order = draft.elements
        .filter((e) => (e.parentId ?? null) === parentId && e.id !== id)
        .map((e) => e.id)
      const idx = draft.elements
        .filter((e) => (e.parentId ?? null) === parentId)
        .map((e) => e.id)
        .indexOf(id)
      order.splice(idx, 0, ...kids.map((k) => k.id))
      if (parentId) {
        const parent = draft.elements.find((e) => e.id === parentId)
        if (parent) parent.children = order.slice()
      }
      const others = draft.elements.filter(
        (e) => (e.parentId ?? null) !== parentId && e.id !== id,
      )
      draft.elements = [
        ...others,
        ...order.map((eid) => draft.elements.find((e) => e.id === eid)!),
      ]
      draft.selectedId = null
      draft.selectedIds = []
    })
  },

  deleteSelected() {
    const id = get().selectedId
    if (!id) return
    apply((draft: BuilderState) => {
      draft.elements = draft.elements.filter((x) => x.id !== id)
      draft.selectedId = null
      draft.selectedIds = []
    })
  },

  bringToFront(id) {
    apply((draft: BuilderState) => {
      const i = draft.elements.findIndex((x) => x.id === id)
      if (i < 0) return
      const [e] = draft.elements.splice(i, 1)
      draft.elements.push(e)
    })
  },

  sendToBack(id) {
    apply((draft: BuilderState) => {
      const i = draft.elements.findIndex((x) => x.id === id)
      if (i < 0) return
      const [e] = draft.elements.splice(i, 1)
      draft.elements.unshift(e)
    })
  },

  nudge(dx, dy) {
    const id = get().selectedId
    if (!id) return
    const el = get().elements.find((x) => x.id === id)
    if (!el) return
    const { snap } = useGridStore.getState()
    get().move(id, { x: el.x + dx, y: el.y + dy }, snap)
  },

  undo() {
    set((state) => useHistoryStore.getState().undo(state))
  },

  redo() {
    set((state) => useHistoryStore.getState().redo(state))
  },

  beginBatch() {
    const history = useHistoryStore.getState()
    set((s) => {
      const depth = s.historyBatchDepth + 1
      if (depth === 1) history.start()
      return { historyBatchDepth: depth }
    })
  },

  endBatch() {
    const history = useHistoryStore.getState()
    set((s) => {
      const depth = Math.max(0, s.historyBatchDepth - 1)
      if (s.historyBatchDepth > 0 && depth === 0) history.commit()
      return { historyBatchDepth: depth }
    })
  },

  updateMany(patches, recordHistory = true) {
    set((state) => {
      const [next, patchList, inverse] = produceWithPatches(state, (draft: BuilderState) => {
        patches.forEach((p) => {
          const el = draft.elements.find((e) => e.id === p.id)
          if (!el) return
          if ('x' in p) el.x = p.x!
          if ('y' in p) el.y = p.y!
          if ('w' in p) el.w = p.w!
          if ('h' in p) el.h = p.h!
          if (p.props) el.props = { ...(el.props || {}), ...(p.props || {}) }
        })
      })
      if (recordHistory || state.historyBatchDepth > 0) {
        useHistoryStore.getState().push(patchList, inverse)
      }
      return next
    })
  },

  setElements(els) {
    set(
      produce((draft: BuilderState) => {
        draft.elements = els
      }),
    )
  },

  serialize() {
    return JSON.stringify({ elements: get().elements })
  },

  hydrate(json) {
    try {
      const data = JSON.parse(json)
      if (Array.isArray(data.elements)) {
        set({ elements: data.elements, selectedId: null, selectedIds: [], ui: { guides: [] } })
      }
    } catch (e) {
      console.error('Failed to hydrate builder state', e)
    }
  }
}});


