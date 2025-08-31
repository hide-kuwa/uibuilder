import { listDefs, getDef } from '@/lib/registry'
import { useBuilderStore } from '@/store/builderStore'

describe('ui catalog', () => {
  it('lists ui components', () => {
    const keys = listDefs().map((d) => d.key)
    ;['ui.header','ui.footer','ui.sidebar','ui.text','ui.card','ui.panel','ui.hud'].forEach((k) => expect(keys).toContain(k))
  })
  it('defaults present', () => {
    const d = getDef('ui.header')!
    expect(d.meta?.defaultW).toBeGreaterThan(0)
    expect(d.meta?.defaultH).toBeGreaterThan(0)
  })
  it('addFromPalette adds instance', () => {
    const store = useBuilderStore.getState()
    store.addFromPalette('instance', { x: 0, y: 0 }, { componentId: 'ui.text' })
    const els = useBuilderStore.getState().elements
    const el = els[els.length - 1]
    expect(el?.componentId).toBe('ui.text')
    // cleanup
    useBuilderStore.setState({ elements: [] }, true)
  })
})
