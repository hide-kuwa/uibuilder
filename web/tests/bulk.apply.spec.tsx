import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BulkStylePanel from '@/components/panels/BulkStylePanel'
import { setLocale } from '@/lib/i18n/i18n'

describe('BulkStylePanel', () => {
  beforeEach(() => {
    setLocale('en')
  })

  it('applies patch to selection via __mut.applyStyle', () => {
    ;(window as any).__selectionCssProvider = () => [
      { id: 'a', fill: '#000', radius: 8 },
      { id: 'b', fill: '#000', radius: 4 },
    ]
    const spy = vi.fn()
    ;(window as any).__mut = { applyStyle: spy }

    render(<BulkStylePanel />)

    const enable = screen.getByLabelText(/Radius enable/i)
    fireEvent.click(enable)
    const px = screen.getByLabelText(/Radius px/i)
    fireEvent.change(px, { target: { value: '12' } })
    fireEvent.click(screen.getByLabelText(/Radius apply/i))

    fireEvent.click(screen.getByRole('button', { name: /Apply to selection/i }))
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ radius: 12 }))
  })
})

