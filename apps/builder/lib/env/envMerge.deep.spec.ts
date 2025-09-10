import { describe, it, expect } from 'vitest'
import { envMerge } from './envMerge'

describe('envMerge (deep)', () => {
  it('merges nested objects; arrays overwrite', () => {
    const mock = { api: '/', feat: { a: true, list: [1, 2], nested: { k: 'm' } } }
    const live = { api: '/v1', feat: { list: [3], nested: { v: 'l' } } }
    expect(envMerge(mock as any, live as any)).toEqual({ api: '/v1', feat: { a: true, list: [3], nested: { k: 'm', v: 'l' } } })
  })
})

