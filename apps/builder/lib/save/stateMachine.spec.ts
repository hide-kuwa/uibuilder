import { describe, it, expect } from 'vitest'
import { nextState } from './stateMachine'

describe('save state machine', () => {
  it('idle→queued→offline→flushing→saved', () => {
    expect(nextState('idle', 'enqueue')).toBe('queued')
    expect(nextState('queued', 'offline')).toBe('offline')
    expect(nextState('offline', 'reconnect')).toBe('flushing')
    expect(nextState('flushing', 'done')).toBe('saved')
  })
})

