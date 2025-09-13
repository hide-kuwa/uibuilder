'use client'
import { useEffect, useState, useRef } from 'react'

export function useRovingFocus(count: number) {
  const [idx, setIdx] = useState(0)
  const refs = useRef<Array<HTMLElement | null>>([])
  useEffect(() => { refs.current[idx]?.focus() }, [idx])
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, count - 1)) }
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Home') { e.preventDefault(); setIdx(0) }
    if (e.key === 'End')  { e.preventDefault(); setIdx(count - 1) }
  }
  return { idx, setIdx, refs, onKeyDown }
}

