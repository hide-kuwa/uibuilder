'use client'
import { useActionDebugStore } from '@/store/actionDebugStore'
import { useInteractionRegistry } from '@/store/interactionRegistry'
import { useEditorStore } from '@/store/editorStore'
import type {
  ActionKind,
  BehaviorTrigger,
  ActionLogEntry,
  Action,
  Target,
} from '@/types/interactions'
import { evaluate, template } from './logic'

const throttleMap = new Map<string, number>()
const debounceMap = new Map<string, number>()

function keyFor(nodeId: string, idx: number, kind: string) {
  return `${nodeId}:${idx}:${kind}`
}

function resolveTargets(selector: Target | undefined, el: HTMLElement): HTMLElement[] {
  if (!selector) return [el]
  if (selector.type === 'nodeId') {
    const t = document.querySelector(
      `[data-node-id="${CSS.escape(selector.value)}"]`,
    ) as HTMLElement | null
    return t ? [t] : []
  }
  if (selector.type === 'query') {
    return Array.from(document.querySelectorAll<HTMLElement>(selector.value))
  }
  return [el]
}

function setNodePropById(id: string, prop: string, value: any) {
  const setProp = (useEditorStore.getState() as any).setProp
  if (typeof setProp === 'function') setProp(id, prop, value)
}

async function execOne(a: Action, el: HTMLElement, ctx: any) {
  switch (a.kind) {
    case 'openUrl': {
      const url = template(a.url, ctx)
      const t = a.target ?? '_self'
      if ((window as any).__ACTIONS_INTERCEPT__) break
      if (t === '_blank') window.open(url, '_blank', 'noopener,noreferrer')
      else window.location.href = url
      break
    }
    case 'navigate': {
      const to = template(a.to, ctx)
      if ((window as any).__ACTIONS_INTERCEPT__) break
      try {
        const r = (await import('next/navigation'))
        r.useRouter?.().push?.(to)
      } catch {
        try {
          ;(await import('next/router')).default.push?.(to)
        } catch {}
      }
      break
    }
    case 'emitEvent': {
      const payload = typeof a.payload === 'string' ? template(a.payload, ctx) : a.payload
      window.dispatchEvent(new CustomEvent(a.name, { detail: payload }))
      break
    }
    case 'setProp': {
      const value = typeof a.value === 'string' ? template(a.value, ctx) : a.value
      const els = resolveTargets(a.selector, el)
      els.forEach((elm) => {
        const id = elm.getAttribute('data-node-id')
        if (!id) return
        setNodePropById(id, a.prop, value)
      })
      break
    }
  }
}

function collectNodeMeta(nodeId: string) {
  const { presets, projectDefaultPresetIds } = useInteractionRegistry.getState() as any
  const node = (useEditorStore.getState() as any).tree.find((n: any) => n.id === nodeId)
  const ownIds = Array.isArray(node?.props?.presetIds)
    ? node.props.presetIds
    : node?.props?.presetId
    ? [node.props.presetId]
    : []
  const ids = ownIds.length ? ownIds : projectDefaultPresetIds ?? []
  const chosen = (presets || []).filter((p: any) => ids.includes(p.id))
  const actions = chosen.flatMap((p: any) => p.actions ?? [])
  const when = chosen.flatMap((p: any) => p.when ?? [])
  return { actions, when, presetIds: ids }
}

async function runActionsFor(
  nodeId: string,
  targetEl: HTMLElement,
  trigger: BehaviorTrigger,
) {
  const { actions } = collectNodeMeta(nodeId)
  if (!actions?.length) return
  const st = useEditorStore.getState() as any
  const node = st.tree.find((n: any) => n.id === nodeId)
  const ctx = {
    node,
    props: node?.props || {},
    dataset: Object.fromEntries(
      Array.from(targetEl.attributes).map((a) => [a.name, a.value]),
    ),
    now: Date.now(),
    env: { pathname: location.pathname },
  }

  for (let i = 0; i < actions.length; i++) {
    const a = actions[i] as any
    if (a.if !== undefined && !evaluate(a.if, ctx)) continue
    const k = keyFor(nodeId, i, a.kind)
    const now = performance.now()
    const tms = a.throttleMs as number | undefined
    const dms = a.debounceMs as number | undefined
    if (tms && throttleMap.has(k)) {
      const last = throttleMap.get(k)!
      if (now - last < tms) continue
    }
    if (dms) {
      const prev = debounceMap.get(k)
      if (prev) clearTimeout(prev as unknown as number)
      const id = window.setTimeout(() => {
        throttleMap.set(k, performance.now())
        execOne(a, targetEl, ctx)
      }, dms)
      debounceMap.set(k, id as unknown as number)
      continue
    }
    throttleMap.set(k, now)
    await execOne(a, targetEl, ctx)
  }
}

export function installActionRuntime(
  root: HTMLElement,
  opts?: { debug?: boolean; intercept?: boolean },
) {
  const debug = !!opts?.debug
  const intercept = !!opts?.intercept
  ;(window as any).__ACTIONS_INTERCEPT__ = intercept
  const log = (entry: ActionLogEntry) => {
    if (debug) useActionDebugStore.getState().push(entry)
  }

  const runFor = async (trigger: BehaviorTrigger, target: HTMLElement) => {
    const nodeId = target.getAttribute('data-node-id')!
    const meta = collectNodeMeta(nodeId)
    if (!meta.when?.includes(trigger)) return
    const entry: ActionLogEntry = {
      id: Math.random().toString(36).slice(2, 9),
      t0: performance.now(),
      nodeId,
      trigger,
      actions: (meta.actions ?? []).map((a: any) => ({
        kind: (a as any).kind as ActionKind,
        payload: a,
      })),
      presetIds: meta.presetIds,
      status: 'ok',
    }
    try {
      await runActionsFor(nodeId, target, trigger)
    } catch (e: any) {
      entry.status = 'error'
      entry.error = e?.message ?? String(e)
    } finally {
      entry.t1 = performance.now()
      log(entry)
    }
  }

  const onClick = (ev: MouseEvent) => {
    const target = (ev.target as HTMLElement)?.closest('[data-node-id]') as
      | HTMLElement
      | null
    if (!target) return
    ev.preventDefault()
    runFor('click', target)
  }
  const onDbl = (ev: MouseEvent) => {
    const target = (ev.target as HTMLElement)?.closest('[data-node-id]') as
      | HTMLElement
      | null
    if (!target) return
    ev.preventDefault()
    runFor('doubleClick', target)
  }
  root.addEventListener('click', onClick)
  root.addEventListener('dblclick', onDbl)

  const timers = new Map<HTMLElement, any>()
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) runFor('inView', en.target as HTMLElement)
    })
  })

  const setupNode = (el: HTMLElement) => {
    const nodeId = el.getAttribute('data-node-id')
    if (!nodeId) return
    const meta = collectNodeMeta(nodeId)
    if (meta.when?.includes('mount')) runFor('mount', el)
    if (meta.when?.includes('delay')) {
      const ms = parseInt(el.getAttribute('data-action-delay') || '0', 10)
      const t = setTimeout(() => runFor('delay', el), ms)
      timers.set(el, t)
    }
    if (meta.when?.includes('inView')) io.observe(el)
  }

  root.querySelectorAll<HTMLElement>('[data-node-id]').forEach(setupNode)

  const onTest = (e: any) => {
    const { nodeId, trigger } = e.detail || {}
    if (!nodeId || !trigger) return
    const el = root.querySelector(
      `[data-node-id="${CSS.escape(nodeId)}"]`,
    ) as HTMLElement | null
    if (el) runFor(trigger as BehaviorTrigger, el)
  }
  window.addEventListener('actions:test', onTest)

  return () => {
    root.removeEventListener('click', onClick)
    root.removeEventListener('dblclick', onDbl)
    window.removeEventListener('actions:test', onTest)
    timers.forEach((t) => clearTimeout(t))
    io.disconnect()
  }
}
