'use client'

import { useEffect } from 'react'
import { ActionEngine } from '../../builder/lib/actions'

export function ActionBoot() {
  useEffect(() => {
    if (typeof document === 'undefined') return
    const engine = ActionEngine.fromDOM(document)
    return () => engine.destroy()
  }, [])
  return null
}

export default ActionBoot
