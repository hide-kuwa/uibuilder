/* eslint-disable @typescript-eslint/no-explicit-any */
import { decodeActionRules } from './serialize'
import type { ActionEffect, ActionRule, ActionTrigger } from './types'

type TriggerDispatch = 'click' | 'hover:enter' | 'hover:leave' | 'inView'

type RuleRuntime = {
  element: HTMLElement
  rule: ActionRule
  state: { running: boolean; controller?: AbortController }
  onceFired: Set<number>
}

type ObserverEntry = { runtime: RuleRuntime; triggerIndex: number }

type ObserverGroup = {
  observer: IntersectionObserver
  targets: Map<Element, ObserverEntry[]>
}

type ListenerRecord = {
  target: Document | HTMLElement
  type: string
  listener: EventListenerOrEventListenerObject
  options?: boolean | AddEventListenerOptions
}

const DEFAULT_DURATION = 150
const DEFAULT_DELAY = 0
const DEFAULT_EASING = 'ease-out'

const asArray = <T,>(value: T | T[] | undefined): T[] => {
  if (value == null) return []
  return Array.isArray(value) ? value : [value]
}

const detectReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

const closestInteractiveNode = (el: Element | null): HTMLElement | null => {
  if (!el) return null
  return (el.closest('[data-int]') as HTMLElement | null) ?? null
}

const matchesTrigger = (trigger: ActionTrigger, dispatch: TriggerDispatch) => {
  if (trigger.kind === 'click') return dispatch === 'click'
  if (trigger.kind === 'hover') {
    const phase = trigger.phase ?? 'enter'
    return (phase === 'enter' && dispatch === 'hover:enter') || (phase === 'leave' && dispatch === 'hover:leave')
  }
  if (trigger.kind === 'inView') return dispatch === 'inView'
  return false
}

const waitFor = (ms: number, signal: AbortSignal) => {
  if (ms <= 0) return Promise.resolve()
  return new Promise<void>((resolve, reject) => {
    const id = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(id)
      signal.removeEventListener('abort', onAbort)
      reject(new Error('aborted'))
    }
    signal.addEventListener('abort', onAbort)
  })
}

const dispatchCustomEvent = (name: string, detail: any) => {
  if (typeof window === 'undefined') return
  const ev = new CustomEvent(name, { detail }) as Event
  window.dispatchEvent(ev)
}

const scrollIntoView = (selector: string, behavior?: ScrollBehavior) => {
  if (typeof document === 'undefined') return
  const target = document.querySelector(selector) as HTMLElement | null
  target?.scrollIntoView({ behavior: behavior ?? 'smooth' })
}

const navigateTo = (href: string, target?: '_self' | '_blank') => {
  if (typeof window === 'undefined') return
  if (target === '_blank') {
    window.open(href, '_blank', 'noopener,noreferrer')
  } else {
    window.location.href = href
  }
}

export const collectRulesFromDataAttrs = (root: ParentNode) => {
  const pairs: Array<{ element: HTMLElement; rules: ActionRule[] }> = []
  const nodes = root.querySelectorAll<HTMLElement>('[data-int]')
  nodes.forEach((el) => {
    const attr = el.getAttribute('data-int')
    if (!attr) return
    const sourceId = el.getAttribute('data-node-id') ?? ''
    const rules = decodeActionRules(attr, sourceId)
    if (!rules.length) return
    pairs.push({ element: el, rules })
  })
  return pairs
}

export interface ActionEngineOptions {
  reducedMotion?: boolean
}

export class ActionEngine {
  private root!: Document | HTMLElement
  private scope!: ParentNode
  private reducedMotion: boolean
  private listeners: ListenerRecord[] = []
  private elementRules = new Map<HTMLElement, RuleRuntime[]>()
  private inViewObservers = new Map<string, ObserverGroup>()

  constructor(opts?: ActionEngineOptions) {
    this.reducedMotion = opts?.reducedMotion ?? detectReducedMotion()
  }

  static bind(
    root: Document | HTMLElement,
    pairs: Array<{ element: HTMLElement; rules: ActionRule[] }>,
    opts?: ActionEngineOptions,
  ) {
    const engine = new ActionEngine(opts)
    engine.attach(root)
    pairs.forEach((pair) => engine.register(pair.element, pair.rules))
    return engine
  }

  static fromDOM(root: Document | HTMLElement, opts?: ActionEngineOptions) {
    const parent: ParentNode = root instanceof Document ? root : (root as unknown as ParentNode)
    const pairs = collectRulesFromDataAttrs(parent)
    return ActionEngine.bind(root, pairs, opts)
  }

  destroy() {
    for (const rec of this.listeners) rec.target.removeEventListener(rec.type, rec.listener, rec.options)
    this.listeners = []
    this.inViewObservers.forEach((group) => group.observer.disconnect())
    this.inViewObservers.clear()
    this.elementRules.clear()
  }

  private attach(root: Document | HTMLElement) {
    this.root = root
    this.scope = root instanceof Document ? root : (root as unknown as ParentNode)
    this.addListener(root, 'click', (event) => {
      const target = closestInteractiveNode(event.target as Element | null)
      if (!target) return
      this.dispatch(target, 'click', event)
    }, true)
    this.addListener(root, 'mouseover', (event: Event) => {
      const e = event as MouseEvent
      const target = closestInteractiveNode(e.target as Element | null)
      if (!target) return
      const rel = e.relatedTarget as Node | null
      if (rel && target.contains(rel)) return
      this.dispatch(target, 'hover:enter', event)
    }, true)
    this.addListener(root, 'mouseout', (event: Event) => {
      const e = event as MouseEvent
      const target = closestInteractiveNode(e.target as Element | null)
      if (!target) return
      const rel = e.relatedTarget as Node | null
      if (rel && target.contains(rel)) return
      this.dispatch(target, 'hover:leave', event)
    }, true)
  }

  private addListener(
    target: Document | HTMLElement,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
    target.addEventListener(type, listener, options)
    this.listeners.push({ target, type, listener, options })
  }

  private register(element: HTMLElement, rules: ActionRule[]) {
    const list = this.elementRules.get(element) ?? []
    const elementSourceId = element.getAttribute?.('data-node-id') ?? ''
    rules.forEach((rule) => {
      if (!rule.sourceId) rule.sourceId = elementSourceId
      const runtime: RuleRuntime = {
        element,
        rule: { ...rule },
        state: { running: false },
        onceFired: new Set(),
      }
      list.push(runtime)
      this.registerTriggers(runtime)
    })
    if (list.length) this.elementRules.set(element, list)
  }

  private registerTriggers(runtime: RuleRuntime) {
    runtime.rule.triggers.forEach((trigger, index) => {
      if (trigger.kind === 'inView') this.registerInView(runtime, index, trigger)
    })
  }

  private observerKey(trigger: Extract<ActionTrigger, { kind: 'inView' }>) {
    const th = trigger.threshold ?? 0
    const rm = trigger.rootMargin ?? ''
    return JSON.stringify([th, rm])
  }

  private registerInView(runtime: RuleRuntime, triggerIndex: number, trigger: Extract<ActionTrigger, { kind: 'inView' }>) {
    const key = this.observerKey(trigger)
    let group = this.inViewObservers.get(key)
    if (!group) {
      const options: IntersectionObserverInit = {
        threshold: trigger.threshold ?? 0,
        rootMargin: trigger.rootMargin,
      }
      const observer = new IntersectionObserver((entries) => this.handleInView(entries, key), options)
      group = { observer, targets: new Map() }
      this.inViewObservers.set(key, group)
    }
    const current = group.targets.get(runtime.element) ?? []
    current.push({ runtime, triggerIndex })
    group.targets.set(runtime.element, current)
    group.observer.observe(runtime.element)
  }

  private handleInView(entries: IntersectionObserverEntry[], key: string) {
    const group = this.inViewObservers.get(key)
    if (!group) return
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      const arr = group.targets.get(entry.target as Element)
      if (!arr?.length) return
      arr.slice().forEach(({ runtime, triggerIndex }) => {
        const trigger = runtime.rule.triggers[triggerIndex]
        if (trigger?.kind !== 'inView') return
        if (trigger.once && runtime.onceFired.has(triggerIndex)) return
        this.runRule(runtime, triggerIndex, entry)
        if (trigger.once) this.removeInViewTarget(key, runtime.element, triggerIndex)
      })
    })
  }

  private removeInViewTarget(key: string, element: Element, triggerIndex: number) {
    const group = this.inViewObservers.get(key)
    if (!group) return
    const arr = group.targets.get(element)
    if (!arr) return
    const next = arr.filter((item) => item.triggerIndex !== triggerIndex)
    if (next.length) group.targets.set(element, next)
    else {
      group.targets.delete(element)
      group.observer.unobserve(element)
    }
  }

  private dispatch(element: HTMLElement, dispatch: TriggerDispatch, detail: any) {
    const runtimes = this.elementRules.get(element)
    if (!runtimes) return
    runtimes.forEach((runtime) => {
      runtime.rule.triggers.forEach((trigger, index) => {
        if (!matchesTrigger(trigger, dispatch)) return
        if (trigger.once && runtime.onceFired.has(index)) return
        this.runRule(runtime, index, detail)
        if (trigger.once) runtime.onceFired.add(index)
      })
    })
  }

  private resolveTargets(target: string | string[] | undefined, source: HTMLElement) {
    const ids = asArray(target)
    if (!ids.length) return [source]
    const hits: HTMLElement[] = []
    ids.forEach((id) => {
      const sel = `[data-node-id="${id}"]`
      const found = this.scope.querySelector(sel) as HTMLElement | null
      if (found) hits.push(found)
    })
    return hits.length ? hits : [source]
  }

  private applyEffect(effect: ActionEffect, runtime: RuleRuntime, signal: AbortSignal) {
    switch (effect.kind) {
      case 'class': {
        const targets = this.resolveTargets(effect.target, runtime.element)
        targets.forEach((el) => {
          effect.remove?.forEach((cls) => el.classList.remove(cls))
          effect.toggle?.forEach((cls) => el.classList.toggle(cls))
          effect.add?.forEach((cls) => el.classList.add(cls))
        })
        break
      }
      case 'emit':
        dispatchCustomEvent(effect.name, effect.detail)
        break
      case 'scroll':
        scrollIntoView(effect.selector, effect.behavior)
        break
      case 'navigate':
        navigateTo(effect.href, effect.target)
        break
      default:
        break
    }
  }

  private resolveTransition(rule: ActionRule) {
    const base = rule.transition ?? {}
    const disable = rule.disableMotionWhenReduced !== false
    const factor = this.reducedMotion && disable ? 0 : 1
    const delay = Math.max(0, Math.round((base.delayMs ?? DEFAULT_DELAY) * factor))
    const duration = Math.max(0, Math.round((base.durationMs ?? DEFAULT_DURATION) * factor))
    return { delay, duration, easing: base.easing ?? DEFAULT_EASING }
  }

  private runRule(runtime: RuleRuntime, triggerIndex: number, detail: any) {
    const state = runtime.state
    const rule = runtime.rule
    const concurrency = rule.concurrency ?? 'restart'
    if (state.running) {
      if (concurrency === 'ignore') return
      state.controller?.abort()
    }
    const controller = new AbortController()
    state.running = true
    state.controller = controller
    runtime.onceFired.add(triggerIndex)
    const transition = this.resolveTransition(rule)
    const execute = async () => {
      try {
        if (transition.delay > 0) await waitFor(transition.delay, controller.signal)
        for (const effect of rule.effects) {
          this.applyEffect(effect, runtime, controller.signal)
          if (controller.signal.aborted) return
        }
        if (transition.duration > 0) await waitFor(transition.duration, controller.signal)
      } catch {
        /* ignore */
      } finally {
        if (state.controller === controller) {
          state.running = false
          state.controller = undefined
        }
      }
    }
    void execute()
  }
}
