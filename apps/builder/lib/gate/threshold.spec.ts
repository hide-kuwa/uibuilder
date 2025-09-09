import { describe, it, expect } from 'vitest'
import { gateNeeded } from './threshold'

describe('gate threshold', () => {
  it('<70 triggers', () => expect(gateNeeded(69)).toBe(true))
  it('==70 does not', () => expect(gateNeeded(70)).toBe(false))
  it('>70 does not', () => expect(gateNeeded(71)).toBe(false))
})

