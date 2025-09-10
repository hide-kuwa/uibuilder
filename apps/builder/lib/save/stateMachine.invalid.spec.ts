import { describe, it, expect } from 'vitest'
import { nextState } from './stateMachine'

describe('save state machine invalid transitions', () => {
  it('unknown event keeps state (no throw)', () => {
    expect(nextState('saved' as any, '???' as any)).toBe('saved')
    expect(nextState('idle' as any, '???' as any)).toBe('idle')
  })
})

