/* eslint-disable @typescript-eslint/no-explicit-any */
import { decodeActionRules } from './serialize'
import type {
  ActionEffect,
  ActionPreset,
  ActionRule,
  ActionTrigger,
  Effect,
  Trigger,
} from './types'

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

type ElementRulePair = { element: HTMLElement; rules: ActionRule[] }

type StyleBindingOptions = { nodeId: string; presets?: ActionPreset[] }

type Binding = {
  update: (presets: ActionPreset[]) => void
  destroy: () => void
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

  static bind(root: Document | HTMLElement, pairs: ElementRulePair[], opts?: ActionEngineOptions): ActionEngine
  static bind(root: HTMLElement, opts: StyleBindingOptions): Binding
  static bind(
    root: Document | HTMLElement,
    arg: ElementRulePair[] | StyleBindingOptions,
    opts?: ActionEngineOptions,
  ): ActionEngine | Binding {
    if (Array.isArray(arg)) {
      const engine = new ActionEngine(opts)
      engine.attach(root)
      arg.forEach((pair) => engine.register(pair.element, pair.rules))
      return engine
    }
    if (root instanceof HTMLElement) {
      return createStyleBinding(root, arg)
    }
    throw new Error('Invalid arguments passed to ActionEngine.bind')
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
      this.ensureObservers(runtime)
    })
    this.elementRules.set(element, list)
  }

  private ensureObservers(runtime: RuleRuntime) {
    runtime.rule.triggers.forEach((trigger, index) => {
      if (trigger.kind !== 'inView') return
      const threshold = trigger.threshold ?? 0
      const key = `${threshold}:${trigger.rootMargin ?? ''}`
      let group = this.inViewObservers.get(key)
      if (!group) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const targets = group?.targets.get(entry.target)
              if (!targets) return
              targets.forEach((item) => {
                const trig = runtime.rule.triggers[item.triggerIndex]
                const t = trig.kind === 'inView' ? trig.threshold ?? 0 : 0
                const isIntersecting = entry.isIntersecting && entry.intersectionRatio >= t
                if (isIntersecting) this.dispatch(item.runtime.element, 'inView', entry)
              })
            })
          },
          { threshold, rootMargin: trigger.rootMargin },
        )
        group = { observer, targets: new Map() }
        this.inViewObservers.set(key, group)
      }
      let list = group.targets.get(runtime.element)
      if (!list) {
        list = []
        group.targets.set(runtime.element, list)
        group.observer.observe(runtime.element)
      }
      list.push({ runtime, triggerIndex: index })
    })
  }

  private dispatch(target: HTMLElement, dispatch: TriggerDispatch, event: Event | IntersectionObserverEntry) {
    const list = this.elementRules.get(target)
    if (!list) return
    list.forEach((runtime) => this.startRule(runtime, dispatch, event))
  }

  private startRule(runtime: RuleRuntime, dispatch: TriggerDispatch, event: Event | IntersectionObserverEntry) {
    const { rule, state, onceFired } = runtime
    const triggerIndex = rule.triggers.findIndex((trigger) => matchesTrigger(trigger, dispatch))
    if (triggerIndex === -1) return
    if (onceFired.has(triggerIndex)) return
    const trigger = rule.triggers[triggerIndex]
    if (trigger.once) onceFired.add(triggerIndex)

    if (state.running) {
      if (rule.concurrency === 'ignore') return
      state.controller?.abort()
    }

    const controller = new AbortController()
    state.running = true
    state.controller = controller

    void this.runEffects(runtime, trigger, event, controller.signal)
      .catch(() => {})
      .finally(() => {
        if (state.controller === controller) {
          state.running = false
          state.controller = undefined
        }
      })
  }

  private async runEffects(
    runtime: RuleRuntime,
    trigger: ActionTrigger,
    event: Event | IntersectionObserverEntry,
    signal: AbortSignal,
  ) {
    const { rule, element } = runtime
    const transition = rule.transition ?? {}
    const duration = transition.durationMs ?? DEFAULT_DURATION
    const delay = transition.delayMs ?? DEFAULT_DELAY
    const easing = transition.easing ?? DEFAULT_EASING
    const shouldDisableMotion = !!(rule.disableMotionWhenReduced && (this.reducedMotion || transition.durationMs === 0))

    if (delay > 0 && !shouldDisableMotion) await waitFor(delay, signal)

    for (const effect of rule.effects) {
      if (signal.aborted) throw new Error('aborted')
      await this.applyEffect(effect, element, trigger, event, {
        duration,
        easing,
        skipMotion: shouldDisableMotion,
        signal,
      })
    }
  }

  private async applyEffect(
    effect: ActionEffect,
    element: HTMLElement,
    trigger: ActionTrigger,
    event: Event | IntersectionObserverEntry,
    opts: { duration: number; easing: string; skipMotion: boolean; signal: AbortSignal },
  ) {
    switch (effect.kind) {
      case 'class': {
        const targets = this.resolveEffectTargets(effect.target, element)
        targets.forEach((target) => {
          asArray(effect.add).forEach((cls) => target.classList.add(cls))
          asArray(effect.remove).forEach((cls) => target.classList.remove(cls))
          asArray(effect.toggle).forEach((cls) => target.classList.toggle(cls))
        })
        return
      }
      case 'emit':
        dispatchCustomEvent(effect.name, {
          trigger,
          event,
          detail: effect.detail,
          element,
        })
        return
      case 'scroll':
        scrollIntoView(effect.selector, effect.behavior)
        return
      case 'navigate':
        navigateTo(effect.href, effect.target)
        return
      default:
        break
    }
  }

  private resolveEffectTargets(target: string | string[] | undefined, element: HTMLElement) {
    if (!target) return [element]
    const selectors = asArray(target)
    const out: HTMLElement[] = []
    selectors.forEach((selector) => {
      const matches = this.scope.querySelectorAll<HTMLElement>(selector)
      matches.forEach((match) => out.push(match))
    })
    return out.length ? out : [element]
  }
}

const visualTriggers: Trigger[] = ['hover', 'active', 'focus', 'focusWithin', 'groupHover']
const selectorForTrigger: Record<Trigger, (base: string) => string> = {
  hover: (base) => `${base}:hover`,
  active: (base) => `${base}:active`,
  focus: (base) => `${base}:focus`,
  focusWithin: (base) => `${base}:focus-within`,
  groupHover: (base) => `.group:hover ${base}`,
}

const shadowMap = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const

const esc = (value: string) => {
  try {
    if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
      return CSS.escape(value)
    }
  } catch (err) {
    console.warn('Failed to escape CSS selector', err)
  }
  return value
}

function effectsToDecls(
  effects: Effect[],
  ms = 150,
  easing = 'cubic-bezier(.2,.8,.2,1)',
) {
  const decls: string[] = []
  const transforms: string[] = []

  for (const ef of effects) {
    if (ef.kind === 'bgColor') decls.push(`background-color:${ef.value} !important`)
    else if (ef.kind === 'textColor') decls.push(`color:${ef.value} !important`)
    else if (ef.kind === 'borderColor') decls.push(`border-color:${ef.value} !important`)
    else if (ef.kind === 'shadow') decls.push(`box-shadow:${shadowMap[ef.value]} !important`)
    else if (ef.kind === 'scale') transforms.push(`scale(${ef.value})`)
    else if (ef.kind === 'opacity') decls.push(`opacity:${ef.value}`)
    else if (ef.kind === 'translate') transforms.push(`translate(${ef.x ?? 0}px, ${ef.y ?? 0}px)`)
    else if (ef.kind === 'rotate') transforms.push(`rotate(${ef.deg}deg)`)
    else if (ef.kind === 'outline') {
      decls.push(`outline:${ef.width}px ${ef.style ?? 'solid'} ${ef.color}`)
      decls.push('outline-offset:0')
    } else if (ef.kind === 'cursor') decls.push(`cursor:${ef.value}`)
  }

  if (transforms.length) decls.push(`transform:${transforms.join(' ')} !important`)
  decls.push(`transition: all ${ms}ms ${easing}`)
  return decls.join(';')
}

function buildPresetCss(nodeId: string, preset: ActionPreset) {
  if (!Array.isArray(preset.effects) || preset.effects.length === 0) return ''
  const triggers = Array.isArray(preset.triggers)
    ? preset.triggers.filter((t): t is Trigger => visualTriggers.includes(t))
    : []
  if (!triggers.length) return ''

  const baseSelector = `[data-node-id="${esc(nodeId)}"]`
  const decls = effectsToDecls(
    preset.effects,
    preset.transitionMs ?? 150,
    preset.easing ?? 'cubic-bezier(.2,.8,.2,1)',
  )
  return triggers
    .map((trigger) => `${selectorForTrigger[trigger](baseSelector)}{${decls}}`)
    .join('\n')
}

export function buildCombinedCss(nodeId: string, presets: ActionPreset[] = []) {
  if (!Array.isArray(presets)) return ''
  return presets
    .map((preset) => buildPresetCss(nodeId, preset))
    .filter(Boolean)
    .join('\n')
}

function createStyleBinding(root: HTMLElement, opts: StyleBindingOptions): Binding {
  const styleId = `action-engine-${opts.nodeId}`
  let styleEl = root.querySelector(
    `style[data-action-engine="${styleId}"]`,
  ) as HTMLStyleElement | null

  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.dataset.actionEngine = styleId
    root.appendChild(styleEl)
  }

  const apply = (presets: ActionPreset[] = []) => {
    styleEl!.textContent = buildCombinedCss(opts.nodeId, presets)
  }

  apply(opts.presets ?? [])

  return {
    update(nextPresets) {
      apply(nextPresets)
    },
    destroy() {
      styleEl?.remove()
    },
  }
}

