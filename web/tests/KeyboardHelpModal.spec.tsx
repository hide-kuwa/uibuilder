import { describe, it, expect } from 'vitest'
import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import RootHotkeys from '@/components/RootHotkeys'

// Simple harness to mount/unmount in jsdom
function mount(el: HTMLElement) {
  const root = createRoot(el)
  root.render(<RootHotkeys />)
  return () => root.unmount()
}

describe('KeyboardHelpModal', () => {
  it('opens on Ctrl/Cmd+? and closes on Esc', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const unmount = mount(host)

    // Open via Ctrl+?
    const ev1 = new KeyboardEvent('keydown', { key: '/', shiftKey: true, ctrlKey: true, bubbles: true })
    window.dispatchEvent(ev1)
    expect(document.body.innerHTML).toContain('Keyboard Shortcuts')

    // Close via Escape
    const ev2 = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    window.dispatchEvent(ev2)

    // Allow microtask flush
    await Promise.resolve()
    expect(document.body.innerHTML).not.toContain('Keyboard Shortcuts')

    unmount()
  })
})

