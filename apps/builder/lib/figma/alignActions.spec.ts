import { describe, it, expect, beforeEach } from 'vitest'
import { useFigmaStore } from './store'
import { alignSelected, distributeSelected } from './alignActions'

const baseDoc = structuredClone(useFigmaStore.getState().doc)

beforeEach(() => {
  useFigmaStore.setState({ doc: structuredClone(baseDoc), selectedIds: [] })
})

describe('alignSelected', () => {
  it('aligns left', () => {
    const page = useFigmaStore.getState().doc.pages[0]
    page.root.children.push(
      { id: 'r1', type: 'RECT', x: 100, y: 0, width: 10, height: 10 },
      { id: 'r2', type: 'RECT', x: 150, y: 20, width: 10, height: 10 }
    )
    useFigmaStore.setState({ selectedIds: ['r1', 'r2'] })
    alignSelected('left')
    const n1: any = page.root.children.find((n) => n.id === 'r1')
    const n2: any = page.root.children.find((n) => n.id === 'r2')
    expect(n1.x).toBe(100)
    expect(n2.x).toBe(100)
  })
})

describe('distributeSelected', () => {
  it('distributes horizontally', () => {
    const page = useFigmaStore.getState().doc.pages[0]
    page.root.children.push(
      { id: 'a', type: 'RECT', x: 0, y: 0, width: 10, height: 10 },
      { id: 'b', type: 'RECT', x: 40, y: 0, width: 10, height: 10 },
      { id: 'c', type: 'RECT', x: 90, y: 0, width: 10, height: 10 }
    )
    useFigmaStore.setState({ selectedIds: ['a', 'b', 'c'] })
    distributeSelected('horizontal')
    const a: any = page.root.children.find((n) => n.id === 'a')
    const b: any = page.root.children.find((n) => n.id === 'b')
    const c: any = page.root.children.find((n) => n.id === 'c')
    expect(a.x).toBe(0)
    expect(b.x).toBeCloseTo(45)
    expect(c.x).toBeCloseTo(90)
  })
})

