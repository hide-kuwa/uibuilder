import { describe, it, expect } from 'vitest'
import { nextState } from './stateMachine'

describe('save state machine (pure mapping)', () => {
  it('idle → saving → saved, and error/reset flow', () => {
    expect(nextState('idle', 'start')).toBe('saving')
    expect(nextState('saving', 'success')).toBe('saved')
    // saved can start again
    expect(nextState('saved', 'start')).toBe('saving')
    // failure path and recovery
    expect(nextState('saving', 'fail')).toBe('error')
    expect(nextState('error', 'reset')).toBe('idle')
  })
})

