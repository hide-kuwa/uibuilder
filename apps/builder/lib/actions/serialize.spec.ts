import { describe, it, expect } from 'vitest'
import { encodeActionRules, decodeActionRules, serializeRule } from './serialize'
import type { ActionRule } from './types'

describe('actions serialize', () => {
  it('produces deterministic strings for equivalent rules', () => {
    const base: ActionRule = {
      sourceId: 'node-1',
      triggers: [{ kind: 'click' }, { kind: 'hover', phase: 'enter' }],
      effects: [{ kind: 'class', add: ['bg-blue-500', 'text-sm', 'bg-blue-500'] }],
      transition: { durationMs: 150, delayMs: 0, easing: 'ease-out' },
    }
    const variant: ActionRule = {
      sourceId: 'node-1',
      triggers: [{ kind: 'hover', phase: 'enter' }, { kind: 'click' }],
      effects: [{ kind: 'class', add: ['text-sm', 'bg-blue-500'] }],
      transition: { durationMs: 150, delayMs: 0, easing: 'ease-out' },
    }

    const a = serializeRule(base)
    const b = serializeRule(variant)
    expect(a).toBe(b)
  })

  it('omits default transition values and rounds numbers', () => {
    const rule: ActionRule = {
      sourceId: 'node-2',
      triggers: [{ kind: 'inView', threshold: 0.3333333 }],
      effects: [
        { kind: 'class', add: ['opacity-0'], toggle: ['opacity-100', 'opacity-100'] },
      ],
      transition: { durationMs: 275.678, delayMs: 0, easing: 'ease-in-out' },
      concurrency: 'ignore',
    }

    const serialized = serializeRule(rule)
    expect(serialized).toContain('0.3333')
    expect(serialized.includes('150')).toBe(false)
    expect(serialized).toContain('"d":275.678')
    const decoded = decodeActionRules(serialized, 'node-2')
    expect(decoded[0].effects[0]).toMatchObject({ toggle: ['opacity-100'] })
    expect(decoded[0].transition).toMatchObject({ durationMs: 275.678, easing: 'ease-in-out' })
    expect(decoded[0].concurrency).toBe('ignore')
  })

  it('encodes multiple rules deterministically', () => {
    const rules: ActionRule[] = [
      {
        sourceId: 'a',
        triggers: [{ kind: 'click' }],
        effects: [{ kind: 'emit', name: 'test' }],
      },
      {
        sourceId: 'b',
        triggers: [{ kind: 'hover', phase: 'leave' }],
        effects: [{ kind: 'class', remove: ['hidden', 'hidden'] }],
      },
    ]
    const encoded = encodeActionRules(rules)
    const again = encodeActionRules([...rules].reverse())
    expect(encoded).toBe(again)
  })
})
