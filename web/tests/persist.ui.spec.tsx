import { describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { useLocalStorageState } from '@/hooks/useLocalStorageState'

function ToggleExample() {
  const [state, setState] = useLocalStorageState<Record<string, boolean>>('rp:test', { layout: true, style: false })
  return (
    <div>
      <button onClick={() => setState(s => ({ ...s, layout: !s.layout }))}>toggle-layout</button>
      <div data-testid="layout-open">{String(state.layout)}</div>
    </div>
  )
}

describe('UI persistence', () => {
  beforeEach(() => {
    cleanup()
    // reset key
    try { window.localStorage.removeItem('rp:test') } catch {}
  })
  it('restores state across remounts', async () => {
    render(<ToggleExample />)
    expect(screen.getByTestId('layout-open').textContent).toBe('true')
    fireEvent.click(screen.getByText('toggle-layout'))
    expect(screen.getByTestId('layout-open').textContent).toBe('false')
    cleanup()
    render(<ToggleExample />)
    expect(screen.getByTestId('layout-open').textContent).toBe('false')
  })
})

