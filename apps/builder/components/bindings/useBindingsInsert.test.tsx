import { renderHook, act } from '@testing-library/react'
import { useBindingsInsert } from './useBindingsInsert'

describe('useBindingsInsert', () => {
  it('updates on bindings:insert event', () => {
    const { result } = renderHook(() => useBindingsInsert())
    expect(result.current).toBeNull()

    act(() => {
      const detail = { key: 'number.round2', formula: 'round($0,2)' }
      window.dispatchEvent(new CustomEvent('bindings:insert', { detail }))
    })

    expect(result.current?.formula).toBe('round($0,2)')
  })
})

