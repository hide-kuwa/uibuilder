import { describe, it, expect, beforeEach } from 'vitest'
import { useFigmaStore } from './store'
import type { Shadow } from './model'

const baseDoc = structuredClone(useFigmaStore.getState().doc)

beforeEach(() => {
  useFigmaStore.setState({ doc: structuredClone(baseDoc) })
})

describe('updateNodeStyle', () => {
  it('deep merges style without removing siblings', () => {
    const id = 't1'
    useFigmaStore.getState().updateNodeStyle(id, {
      shadows: [{ x: 1, y: 1, blur: 2, spread: 0, color: '#000' }],
    })
    useFigmaStore.getState().updateNodeStyle(id, { radius: { tl: 5 } })
    const node: any = useFigmaStore.getState().doc.pages[0].root.children[0]
    expect(node.style.shadows.length).toBe(1)
    useFigmaStore.getState().updateNodeStyle(id, { radius: { tr: 10 } })
    expect(node.style.radius).toEqual({ tl: 5, tr: 10 })
  })
})

describe('shadow helpers', () => {
  it('pushes and removes shadows', () => {
    const id = 't1'
    useFigmaStore.getState().updateNodeStyle(id, { shadows: [] })
    const s: Shadow = { x: 2, y: 2, blur: 4, spread: 0, color: '#000' }
    useFigmaStore.getState().pushShadow(id, s)
    let node: any = useFigmaStore.getState().doc.pages[0].root.children[0]
    expect(node.style.shadows.length).toBe(1)
    useFigmaStore.getState().removeShadowAt(id, 0)
    node = useFigmaStore.getState().doc.pages[0].root.children[0]
    expect(node.style.shadows.length).toBe(0)
  })
})
