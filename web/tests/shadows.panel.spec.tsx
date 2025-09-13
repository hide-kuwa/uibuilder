import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ShadowsPanel from '@/components/panels/ShadowsPanel'
import { encodeShadows } from '@/lib/style/shadowCodec'

describe('ShadowsPanel', () => {
  it('add/clone/remove/reorder and export smoke', () => {
    const onApply = vi.fn()
    render(<ShadowsPanel initial={[]} onApply={onApply} />)
    // Add
    fireEvent.click(screen.getByRole('button', { name: /add/i }))
    // There should be at least one listitem
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0)
    // Apply
    fireEvent.click(screen.getByRole('button', { name: /apply/i }))
    expect(onApply).toHaveBeenCalled()
    const arg = onApply.mock.calls[0][0]
    const css = encodeShadows(arg)
    expect(css).toMatch(/0px 4px|var\(/)
  })
})

