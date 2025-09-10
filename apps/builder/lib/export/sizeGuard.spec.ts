import { describe, it, expect } from 'vitest'
import { sizeGuardOk } from './sizeGuard'

const mb = (n: number) => Math.round(n * 1024 * 1024)

describe('sizeGuard', () => {
  it('allows 1.99MB', () => expect(sizeGuardOk(mb(1.99))).toBe(true))
  it('blocks 2.01MB', () => expect(sizeGuardOk(mb(2.01))).toBe(false))
})

