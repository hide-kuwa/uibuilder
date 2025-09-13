import { installMutBridge } from '@/adapters/installMutBridge'

// Fake store for testing
const makeStore = () => {
  const tree: any[] = [
    { id: 'a', style: { shadows: [{ x: 1 }], radius: { tl: 4, tr: 4 }, typography: { fontSize: 12, lineHeight: 16 } } },
    { id: 'b', style: { shadows: [{ x: 2 }], radius: 8,            typography: { fontSize: 14 } } },
  ]
  const byId = new Map(tree.map(n => [n.id, n]))
  const selectedIds: string[] = ['a','b']

  return {
    getSelectedIds: () => selectedIds,
    getNodeById: (id: string) => byId.get(id),
    updateNode: (id: string, next: any) => { byId.set(id, { ...(byId.get(id) || {}), ...next }) },
    getStyle: (id: string) => (byId.get(id)?.style ?? {}),
  }
}

describe('mut bridge applyStyle', () => {
  it('replaces arrays, shallow-merges objects, hits all selected ids', () => {
    const s = makeStore()
    installMutBridge({
      getSelectedIds: s.getSelectedIds,
      getNodeById: s.getNodeById,
      updateNode: s.updateNode,
    })
    // @ts-expect-error runtime
    expect(window.__mut).toBeTruthy()

    // arrays replace, objects shallow-merge, number/object overwrite
    // @ts-expect-error runtime
    window.__mut.applyStyle({
      shadows: [{ x: 10, y: 20 }],
      typography: { lineHeight: 20 },
      radius: { tl: 6, tr: 6, br: 6, bl: 6 },
    })

    const A = s.getStyle('a')
    const B = s.getStyle('b')
    expect(A.shadows).toEqual([{ x: 10, y: 20 }])
    expect(B.shadows).toEqual([{ x: 10, y: 20 }])
    expect(A.typography).toEqual({ fontSize: 12, lineHeight: 20 })
    expect(B.typography).toEqual({ fontSize: 14, lineHeight: 20 })
    expect(A.radius).toEqual({ tl: 6, tr: 6, br: 6, bl: 6 })
    expect(B.radius).toEqual({ tl: 6, tr: 6, br: 6, bl: 6 })
  })

  it('no selection → no-throw and no changes', () => {
    const s = makeStore()
    const emptySel = () => [] as string[]
    installMutBridge({
      getSelectedIds: emptySel,
      getNodeById: s.getNodeById,
      updateNode: s.updateNode,
    })
    const before = s.getStyle('a')
    // @ts-expect-error runtime
    window.__mut.applyStyle({ opacity: 0.5 })
    const after = s.getStyle('a')
    expect(after).toEqual(before)
  })
})

