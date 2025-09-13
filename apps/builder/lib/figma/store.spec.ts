import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useFigmaStore } from './store'
import { resolveTokenOrString } from './tokenUtils'
import { buildTransition } from './motion'

describe('figma store — ghost & move', () => {
  beforeEach(() => {
    const s = useFigmaStore.getState()
    const rootId = s.doc.pages[0].root.id
    if (rootId) s.select([rootId])
  })

  it('commitGhost applies rect and clears ghost', () => {
    const s = useFigmaStore.getState()
    const id = s.selectedIds[0]
    s.beginTransform(id)
    s.setGhostRect({ id, x: 111, y: 222, width: 333, height: 444 })
    s.commitGhost()
    const node = useFigmaStore.getState().doc.pages[0].root as any
    expect(node.x).toBe(111)
    expect(node.y).toBe(222)
    expect(node.width).toBe(333)
    expect(node.height).toBe(444)
    expect(useFigmaStore.getState().ghostRect).toBeNull()
  })

  it('updateNode updates position only (min size guarded)', () => {
    const s = useFigmaStore.getState()
    const id = s.selectedIds[0]
    s.updateNode(id, { x: 10, y: 20, width: 0, height: -5 })
    const n = useFigmaStore.getState().doc.pages[0].root as any
    expect(n.x).toBe(10)
    expect(n.y).toBe(20)
    expect(n.width).toBe(1)
    expect(n.height).toBe(1)
  })
})

describe('token resolver', () => {
  it('uses tokens dict when available', () => {
    const css = resolveTokenOrString({ token: 'accent', fallback: '#f00' } as any, { accent: '#00f' })
    expect(css).toBe('#00f')
  })
  it('falls back to CSS var when no dict', () => {
    const css = resolveTokenOrString({ token: 'accent', fallback: '#f00' } as any, undefined)
    expect(css).toBe('var(--accent, #f00)')
  })
  it('passes through strings', () => {
    expect(resolveTokenOrString('#abc', {})).toBe('#abc')
  })
})

describe('buildTransition', () => {
  it('simple union -> all transition', () => {
    expect(buildTransition({ durationMs: 200, easing: 'linear', delayMs: 50 } as any))
      .toBe('all 200ms linear 50ms')
  })
  it('array form -> per property', () => {
    const tr = buildTransition({ transition: [
      { property: 'transform', durationMs: 120 },
      { property: 'opacity', durationMs: 200, easing: 'ease-in' }
    ] } as any)
    expect(tr).toContain('transform 120ms')
    expect(tr).toContain('opacity 200ms ease-in 0ms')
  })
})

/**
 * alt+drag duplicate & snap commit 回帰テスト
 * - applySnap をモックして (+10, +10) にスナップするように上書き
 * - beginTransform → setGhostRect(applySnap(...)) → commitGhost
 * - duplicateNode が存在する実装なら、複製してから移動（選択IDが変わる挙動）にも対応
 */
describe('figma store — alt-drag duplicate & snap commit', () => {
  let restoreApplySnap: (() => void) | null = null

  beforeEach(() => {
    const s = useFigmaStore.getState()
    const original = s.applySnap
    useFigmaStore.setState({
      applySnap: (r: { id: string; x: number; y: number; width: number; height: number }) => ({
        ...r,
        x: r.x + 10,
        y: r.y + 10,
      }),
    })
    restoreApplySnap = () => useFigmaStore.setState({ applySnap: original })
  })

  afterEach(() => {
    restoreApplySnap?.()
    restoreApplySnap = null
  })

  it('commits snapped rect; duplicates when supported', () => {
    let s = useFigmaStore.getState()
    // Ensure a selection exists
    if (!s.selectedIds.length) {
      const rootId = s.doc.pages[0].root.id
      s.select([rootId])
      s = useFigmaStore.getState()
    }
    const baseId = s.selectedIds[0]
    expect(baseId).toBeTruthy()

    // duplicateNode がある実装なら複製してから操作（なければそのまま）
    let targetId = baseId
    const maybeDup = (s as any).duplicateNode as ((id: string) => string | undefined) | undefined
    if (typeof maybeDup === 'function') {
      const dupId = maybeDup(baseId) ?? baseId
      targetId = dupId
      s.select([dupId])
    }

    s.beginTransform(targetId)
    let start = (useFigmaStore.getState().selectedNode as any)
    if (!start) start = useFigmaStore.getState().doc.pages[0].root as any
    const snapped = useFigmaStore.getState().applySnap({
      id: targetId,
      x: start.x,
      y: start.y,
      width: start.width,
      height: start.height,
    })
    s.setGhostRect(snapped)
    s.commitGhost()

    const root = useFigmaStore.getState().doc.pages[0].root as any
    const find = (n: any, id: string): any => {
      if (n?.id === id) return n
      if (Array.isArray(n?.children)) {
        for (const c of n.children) { const r = find(c, id); if (r) return r }
      }
      return null
    }
    const node = find(root, targetId)
    expect(node?.x).toBe(start.x + 10)
    expect(node?.y).toBe(start.y + 10)
    expect(useFigmaStore.getState().ghostRect).toBeNull()
  })
})

/**
 * 矢印キー相当の nudge（updateNode 経由）回帰テスト
 * - x を +1 だけ動かす
 * - y/width/height は保持（clamp のテストは既存ケースで担保済み）
 */
describe('figma store — nudge via updateNode', () => {
  it('moves only X by +1 and preserves other fields', () => {
    let s = useFigmaStore.getState()
    // Work on a fresh known node: prefer first child if present; else root
    const root = s.doc.pages[0].root as any
    const target = Array.isArray(root.children) && root.children.length ? root.children[0] : root
    const id = target.id as string
    const start = { x: target.x, y: target.y, width: target.width, height: target.height }

    useFigmaStore.getState().updateNode(id, { x: start.x + 1 })

    // find updated target
    const find = (n: any, id2: string): any => {
      if (n?.id === id2) return n
      if (Array.isArray(n?.children)) {
        for (const c of n.children) { const r = find(c, id2); if (r) return r }
      }
      return null
    }
    const n = find(useFigmaStore.getState().doc.pages[0].root as any, id)
    expect(n?.x).toBe(start.x + 1)
    expect(n?.y).toBe(start.y)
    expect(n?.width).toBe(start.width)
    expect(n?.height).toBe(start.height)
  })
})
