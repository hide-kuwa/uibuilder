import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import BulkShadowsQuick from '@/components/panels/bulk/BulkShadowsQuick'

describe('BulkShadowsQuick', () => {
  it('applies a preset to selection via __mut.applyStyle', () => {
    ;(window as any).__selectionCssProvider = () => [{ id: 'a', shadows: [] }, { id: 'b', shadows: [] }]
    const spy = vi.fn(); (window as any).__mut = { applyStyle: spy }
    render(<BulkShadowsQuick />)
    fireEvent.click(screen.getByRole('button', { name: /Soft/i }))
    expect(spy).toHaveBeenCalledWith({ shadows: expect.any(Array) })
  })
})

