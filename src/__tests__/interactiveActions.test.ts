import { getEffectiveWhen } from '@/lib/interactiveActions'
import type { ActionDef } from '@/types/presets-ui'

describe('getEffectiveWhen', () => {
  it('defaults to click when no flags are set', () => {
    const w = getEffectiveWhen({ type: 'openUrl', params: { url: '#' } } as ActionDef)
    expect(w.click).toBe(true)
  })

  it('keeps existing flags', () => {
    const w = getEffectiveWhen({ type: 'openUrl', params: { url: '#' }, when: { mount: true } as any } as ActionDef)
    expect(w.mount).toBe(true)
    expect(w.click).toBeUndefined()
  })
})

