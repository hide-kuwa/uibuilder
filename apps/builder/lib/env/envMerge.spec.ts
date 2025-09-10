import { describe, it, expect } from 'vitest'
import { envMerge } from './envMerge'

describe('envMerge mock→live', () => {
  it('overrides live onto mock without dropping unknown keys', () => {
    const mock = { api: '/', feature: { a: true, b: false }, keep: 'x' }
    const live = { api: '/v1', feature: { b: true } }
    expect(envMerge(mock as any, live as any)).toEqual({ api: '/v1', feature: { a: true, b: true }, keep: 'x' })
  })
})

