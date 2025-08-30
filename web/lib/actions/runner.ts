'use client'
import { useActionDebugStore } from '@/store/actionDebugStore'
import { useInteractionRegistry } from '@/store/interactionRegistry'
import { useEditorStore } from '@/store/editorStore'
import type { ActionKind, BehaviorTrigger, ActionLogEntry } from '@/types/interactions'

type Action = { kind: ActionKind; [key: string]: any }

async function execAction(a: Action, currentEl: HTMLElement, intercept: boolean) {
  switch (a.kind) {
    case 'openUrl': {
      if (intercept) return
      const url = (a as any).url || (a as any).payload?.url
      try {
        if (typeof url === 'string') {
          const u = new URL(url, window.location.href)
          window.open(u.toString(), (a as any).target || '_blank')
        }
      } catch {
        /* ignore */
      }
      return
    }
    case 'navigate': {
      if (intercept) return
      const frameId = (a as any).frameId || (a as any).target
      if (typeof frameId === 'string') {
        window.dispatchEvent(new CustomEvent('navigate', { detail: { frameId } }))
      }
      return
    }
    case 'emitEvent': {
      const name = (a as any).name || (a as any).event || (a as any).payload?.name
      if (name) {
        window.dispatchEvent(new CustomEvent(name, { detail: (a as any).detail }))
      }
      return
    }
    case 'setProp': {
      const path = (a as any).path || (a as any).payload?.path
      const value = (a as any).value ?? (a as any).payload?.value
      const nodeId = currentEl.getAttribute('data-node-id')
      const setProp = (useEditorStore.getState() as any).setProp
      if (nodeId && typeof setProp === 'function' && typeof path === 'string') {
        setProp(nodeId, path, value)
      }
      return
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

export function installActionRuntime(
  root: HTMLElement,
  opts?: { debug?: boolean; intercept?: boolean },
) {
  const debug = !!opts?.debug
  const intercept = !!opts?.intercept
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
      for (const a of meta.actions ?? []) {
        const kind = (a as any).kind as ActionKind
        if (intercept && (kind === 'openUrl' || kind === 'navigate')) {
          entry.status = 'skipped'
          continue
        }
        await execAction(a, target, intercept)
      }
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
