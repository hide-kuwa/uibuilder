import { describe, it, expect, vi } from 'vitest'
import { applyPaletteDrop, DT_KEY } from './paletteToCanvas'

describe('applyPaletteDrop', () => {
  it('instantiates, inserts, and notifies select', () => {
    const insert = vi.fn(() => ({ id: 'n-123', type: 'text' }))
    const select = vi.fn()
    applyPaletteDrop('text', 'parent-1', 0, insert, select)
    expect(insert).toHaveBeenCalledTimes(1)
    const [node, opts] = insert.mock.calls[0]
    expect(node.type).toBe('text')
    expect(opts).toEqual({ parentId: 'parent-1', index: 0 })
    expect(select).toHaveBeenCalledWith('n-123')
  })
})

describe('DT_KEY', () => {
  it('is stable for drag/drop channel', () => {
    expect(DT_KEY).toBe('application/x-uib-palette-id')
  })
})
