import { describe, it, expect } from 'vitest'
import { buildBypassPayloadExt } from './bypassPayloadExt'

describe('bypass payload (extended)', () => {
  it('includes meta (version/client/session) when provided', () => {
    const p = buildBypassPayloadExt(
      { slug: 's', score: 65, user: 'u' },
      { version: '1.0.0-rc', client: 'web', session: 'abc' }
    )
    expect(p).toMatchObject({
      action: 'gate-approve',
      slug: 's',
      score: 65,
      user: 'u',
      version: '1.0.0-rc',
      client: 'web',
      session: 'abc',
    })
    expect(typeof p.ts).toBe('string')
  })
})

