import React from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { describe, it, expect } from 'vitest'

import RootHotkeys from '../components/RootHotkeys'

describe('KeyboardHelpModal', () => {
  it('opens with Ctrl+? and closes with Esc', () => {
    const div = document.createElement('div')
    document.body.appendChild(div)
    const root = createRoot(div)

    act(() => {
      root.render(<RootHotkeys />)
    })

    expect(document.querySelector('[role="dialog"]')).toBeNull()

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: '/', ctrlKey: true, shiftKey: true })
      )
    })
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })
})

