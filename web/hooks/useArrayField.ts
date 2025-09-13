'use client'
import { useCallback, useState } from 'react'

export function useArrayField<T>(initial: T[] = []) {
  const [items, setItems] = useState<T[]>(initial)
  const add = useCallback((v: T) => setItems((s) => [...s, v]), [])
  const remove = useCallback((i: number) => setItems((s) => s.filter((_, idx) => idx !== i)), [])
  const clone = useCallback((i: number) => setItems((s) => { const v = s[i]; return [...s.slice(0, i + 1), structuredClone(v), ...s.slice(i + 1)] }), [])
  const move = useCallback((i: number, dir: -1 | 1) => setItems((s) => {
    const j = i + dir; if (j < 0 || j >= s.length) return s
    const next = s.slice(); const t = next[i]; next[i] = next[j]; next[j] = t; return next
  }), [])
  return { items, setItems, add, remove, clone, move }
}

