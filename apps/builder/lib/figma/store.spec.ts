import { describe, it, expect, beforeEach } from 'vitest'
import { useFigmaStore } from './store'

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
