import React, { createContext, useContext, useMemo } from 'react'

type Scope = 'local' | 'page' | 'frame' | 'app' | 'api'

export interface RuntimeValue {
  page?: Record<string, any>
  frame?: Record<string, any>
  app?: Record<string, any>
  api?: Record<string, any>
}

const Ctx = createContext<RuntimeValue>({})

export function RuntimeProvider({ value, children }: { value: RuntimeValue; children: React.ReactNode }) {
  const v = useMemo(() => value, [value])
  return React.createElement(Ctx.Provider, { value: v }, children as any)
}

export function useFlowRuntime() {
  return useContext(Ctx)
}

export function getRef(runtime: RuntimeValue, scope: Scope, path: string) {
  const root = scope === 'page' ? runtime.page
    : scope === 'frame' ? runtime.frame
    : scope === 'app' ? runtime.app
    : scope === 'api' ? runtime.api
    : undefined
  if (!root) return undefined
  const parts = path.split('.').filter(Boolean)
  let cur: any = root
  for (const p of parts) {
    if (cur == null) return undefined
    cur = cur[p]
  }
  return cur
}

export function evalFormula(expr: string, inputs: any[]) {
  const f = new Function('$0', '$1', '$2', '$3', '$4', 'return (' + expr + ')')
  return f(inputs[0], inputs[1], inputs[2], inputs[3], inputs[4])
}

