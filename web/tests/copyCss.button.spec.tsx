import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import CopyCssButton from '@/components/actions/CopyCssButton'

describe('CopyCssButton', () => {
  it('copies when styles passed directly', async () => {
    ;(globalThis as any).navigator = (globalThis as any).navigator || {}
    ;(globalThis as any).navigator.clipboard = { writeText: vi.fn().mockResolvedValue(undefined) }
    const styles = [{ id: 'x', fill: '#000', radius: 8 }]
    const onCopied = vi.fn()
    render(<CopyCssButton styles={styles as any} onCopied={onCopied} />)
    fireEvent.click(screen.getByRole('button', { name: /copy css/i }))
    await new Promise((r) => setTimeout(r, 0))
    expect(onCopied).toHaveBeenCalled()
  })
})

