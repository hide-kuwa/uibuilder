import { describe, it, expect, vi } from 'vitest'
import { resolveBinding } from '../src'
import type { Bindings } from '@chizu/types'

describe('resolveBinding safety', () => {
  it('falls back to original props on undefined inputs', () => {
    const props = { text: 'base' }
    const bindings: Bindings = { text: { inputs: [{ scope: 'page', path: 'missing' }] } as any }
    const out = resolveBinding({ page:{} } as any, 'n1', props, bindings)
    expect(out.text).toBe('base')
  })

  it('guards formula errors', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(()=>{})
    const props = { n: 1 } as any
    const bindings: Bindings = { n: { inputs: [], formula: { expr: 'throw new Error("x")' } } as any }
    const out = resolveBinding({} as any, 'n2', props, bindings)
    expect(out.n).toBe(1)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('mixes api/page scopes', () => {
    const props = { text: '' }
    const bindings: Bindings = {
      text: {
        inputs: [{ scope:'page', path:'prefCode' } as any, { scope:'api', path:'prefStats' } as any],
        formula: { expr: '`${$1[$0]?.name ?? ""}`' } as any
      } as any
    }
    const runtime = { page:{ prefCode:'13' }, api:{ prefStats: { '13': { name:'東京都' } } } }
    const out = resolveBinding(runtime as any, 'n3', props, bindings)
    expect(out.text).toBe('東京都')
  })
})

