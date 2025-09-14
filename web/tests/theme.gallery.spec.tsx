import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ThemeGallery from '@/components/panels/ThemeGallery'

describe('ThemeGallery', () => {
  it('applies a preset via __io.applyImportedThemes', () => {
    const spy = vi.fn()
    ;(window as any).__io = { applyImportedThemes: spy }
    render(<ThemeGallery />)
    // Click any Apply button
    const btn = screen.getAllByRole('button', { name: /Apply/i })[0]
    fireEvent.click(btn)
    expect(spy).toHaveBeenCalled()
  })
})

