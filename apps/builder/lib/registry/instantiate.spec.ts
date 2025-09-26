import { describe, it, expect } from 'vitest'
import { instantiatePaletteId } from './instantiate'

describe('instantiatePaletteId', () => {
  it('creates a text node with default props', () => {
    const node = instantiatePaletteId('text')
    expect(node.type).toBe('text')
    expect(node.props?.text).toBe('Text')
  })

  it('falls back to frame for unknown id', () => {
    const node = instantiatePaletteId('unknown-x')
    expect(node.type).toBe('frame')
  })
})
