import type { ComponentNode } from '@/types/editor'

export type NodeAction = {
  trigger: 'click' | 'hover' | 'mount'
  type: 'openUrl' | 'emitEvent' | 'setProp' | 'navigate'
  payload?: any
}

export interface ActionRuntimeContext {
  getNode: (id: string) => ComponentNode | undefined
  setProp?: (id: string, path: string, value: any) => void
  navigate?: (frameId: string) => void
}

type Executor = (
  payload: any,
  nodeId: string,
  ctx: ActionRuntimeContext,
) => void

const executors: Record<string, Executor> = {
  openUrl: (payload) => {
    const url = payload?.url
    if (typeof url !== 'string') return
    try {
      const u = new URL(url, window.location.href)
      if (u.protocol === 'http:' || u.protocol === 'https:')
        window.open(u.toString(), payload?.target || '_blank')
    } catch {
      /* ignore */
    }
  },
  navigate: (payload, _id, ctx) => {
    const frameId = payload?.frameId || payload?.id || payload?.target
    if (typeof frameId === 'string') ctx.navigate?.(frameId)
  },
  emitEvent: (payload) => {
    const name = payload?.name
    if (!name) return
    window.dispatchEvent(
      new CustomEvent(name, { detail: payload?.detail }) as Event,
    )
  },
  setProp: (payload, id, ctx) => {
    if (!ctx.setProp) return
    const path = payload?.path
    if (typeof path !== 'string') return
    ctx.setProp(id, path, payload?.value)
  },
}

export function runActionsForNode(
  nodeId: string,
  trigger: 'click' | 'hover' | 'mount',
  ctx: ActionRuntimeContext,
) {
  const node = ctx.getNode(nodeId)
  const actions = (node?.props as any)?.actions as NodeAction[] | undefined
  if (!actions?.length) return
  actions.forEach((a) => {
    if (a.trigger !== trigger) return
    const { trigger: _t, type, payload, ...rest } = a as any
    const pl = payload ?? rest
    const exec = executors[type]
    if (exec) exec(pl, nodeId, ctx)
  })
}

export { executors }
