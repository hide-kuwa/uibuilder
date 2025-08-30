'use client'
import * as React from 'react'
import { installActionRuntime } from '@/lib/actions/runner'

export default function ActionGate({ enabled=true, debug=false, intercept=false, children }:{
  enabled?: boolean; debug?: boolean; intercept?: boolean; children: React.ReactNode
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    const dispose = installActionRuntime(el, { debug, intercept })
    return () => dispose && dispose()
  }, [enabled, debug, intercept])
  return <div ref={ref}>{children}</div>
}
