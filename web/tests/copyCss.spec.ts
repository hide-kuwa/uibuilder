import { describe, it, expect } from 'vitest'
import { selectionToCss, type StyleLike } from '@/lib/style/selectionToCss'

describe('selectionToCss', () => {
  it('emits TokenRef using var(--token, fallback)', () => {
    const nodes: StyleLike[] = [
      { id: 'A', fill: { token: 'bg.primary', fallback: '#fff' }, stroke: { token: 'border.base' }, opacity: { token: 'alpha.80', fallback: '0.8' } }
    ]
    const css = selectionToCss(nodes)
    expect(css).toContain('background: var(--bg.primary, #fff);')
    expect(css).toContain('border-color: var(--border.base);')
    expect(css).toContain('opacity: var(--alpha.80, 0.8);')
  })

  it('handles per-corner radius shorthand', () => {
    const nodes: StyleLike[] = [
      { id: 'B', radius: { tl: 2, tr: 4, br: 8, bl: 16 } }
    ]
    const css = selectionToCss(nodes)
    expect(css).toContain('border-radius: 2px 4px 8px 16px;')
  })

  it('serializes multiple shadows', () => {
    const nodes: StyleLike[] = [
      {
        id: 'C',
        shadows: [
          { x: 0, y: 2, blur: 4, spread: 0, color: 'rgba(0,0,0,.2)' },
          { x: 0, y: 1, blur: 2, spread: 0, color: 'rgba(0,0,0,.1)', inset: true },
        ],
      },
    ]
    const css = selectionToCss(nodes)
    expect(css).toContain('box-shadow: 0px 2px 4px 0 rgba(0,0,0,.2), inset 0px 1px 2px 0 rgba(0,0,0,.1);')
  })

  it('joins multiple nodes with spacing and optional id comments', () => {
    const nodes: StyleLike[] = [
      { id: 'X', fill: '#000' },
      { id: 'Y', strokeWidth: 1 },
    ]
    const css = selectionToCss(nodes)
    expect(css).toBe('/* X */\nbackground: #000;\n\n/* Y */\nborder-width: 1px;')
  })
})

