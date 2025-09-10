import { describe, it, expect } from 'vitest'
import { buildBypassPayload } from './bypassPayload'

describe('bypass payload fields', () => {
  it('includes action, slug, score, user, ts ISO', () => {
    const p = buildBypassPayload({ slug: 's', score: 65, user: 'u' })
    expect(p).toMatchObject({ action: 'gate-approve', slug: 's', score: 65, user: 'u' })
    expect(typeof p.ts).toBe('string')
    expect(new Date(p.ts).toString()).not.toBe('Invalid Date')
  })
})

