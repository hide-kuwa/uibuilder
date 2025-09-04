import { create } from 'zustand'

export type BuilderRule = {
  id: string
  trigger: 'click' | 'hover' | 'inview'
  sourceNodeId: string
  enabled: boolean
  action:
    | { type: 'classToggle'; targetNodeId: string; classNames: string[] }
    | { type: 'scrollTo'; selector: string; behavior?: 'smooth' }
    | { type: 'navigate'; href: string }
}

interface RuleStore {
  rules: BuilderRule[]
  addRule: (rule: Omit<BuilderRule, 'id'>) => void
  updateRule: (id: string, rule: Partial<BuilderRule>) => void
  removeRule: (id: string) => void
  toggleRule: (id: string, enabled: boolean) => void
}

const listeners = new Map<string, () => void>()

function runAction(action: BuilderRule['action']) {
  switch (action.type) {
    case 'classToggle': {
      const target = document.querySelector(
        `[data-node-id="${action.targetNodeId}"]`
      ) as HTMLElement | null
      if (!target) return
      action.classNames.forEach((c) => target.classList.toggle(c))
      break
    }
    case 'scrollTo': {
      const el = document.querySelector(action.selector)
      if (el) el.scrollIntoView({ behavior: action.behavior })
      break
    }
    case 'navigate': {
      window.location.href = action.href
      break
    }
  }
}

function attach(rule: BuilderRule) {
  const source = document.querySelector(
    `[data-node-id="${rule.sourceNodeId}"]`
  ) as HTMLElement | null
  if (!source) return

  let cleanup: () => void = () => {}

  if (rule.trigger === 'click') {
    const handler = () => runAction(rule.action)
    source.addEventListener('click', handler)
    cleanup = () => source.removeEventListener('click', handler)
  } else if (rule.trigger === 'hover') {
    if (rule.action.type === 'classToggle') {
      const enter = () => {
        const target = document.querySelector(
          `[data-node-id="${rule.action.targetNodeId}"]`
        ) as HTMLElement | null
        if (!target) return
        rule.action.classNames.forEach((c) => target.classList.add(c))
      }
      const leave = () => {
        const target = document.querySelector(
          `[data-node-id="${rule.action.targetNodeId}"]`
        ) as HTMLElement | null
        if (!target) return
        rule.action.classNames.forEach((c) => target.classList.remove(c))
      }
      source.addEventListener('mouseenter', enter)
      source.addEventListener('mouseleave', leave)
      cleanup = () => {
        source.removeEventListener('mouseenter', enter)
        source.removeEventListener('mouseleave', leave)
      }
    } else {
      const handler = () => runAction(rule.action)
      source.addEventListener('mouseenter', handler)
      cleanup = () => source.removeEventListener('mouseenter', handler)
    }
  } else if (rule.trigger === 'inview') {
    const handler = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) runAction(rule.action)
      })
    }
    const observer = new IntersectionObserver(handler)
    observer.observe(source)
    cleanup = () => observer.disconnect()
  }

  listeners.set(rule.id, cleanup)
}

function detach(id: string) {
  const c = listeners.get(id)
  if (c) c()
  listeners.delete(id)
}

export const useRuleStore = create<RuleStore>((set, get) => ({
  rules: [],
  addRule: (rule) =>
    set((state) => {
      const newRule: BuilderRule = { id: `rule-${Date.now()}`, ...rule }
      if (newRule.enabled) attach(newRule)
      return { rules: [...state.rules, newRule] }
    }),
  updateRule: (id, rule) =>
    set((state) => {
      const rules = state.rules.map((r) =>
        r.id === id ? { ...r, ...rule } : r
      )
      const updated = rules.find((r) => r.id === id)
      detach(id)
      if (updated?.enabled) attach(updated)
      return { rules }
    }),
  removeRule: (id) =>
    set((state) => {
      detach(id)
      return { rules: state.rules.filter((r) => r.id !== id) }
    }),
  toggleRule: (id, enabled) =>
    set((state) => {
      const rules = state.rules.map((r) =>
        r.id === id ? { ...r, enabled } : r
      )
      detach(id)
      const rule = rules.find((r) => r.id === id)
      if (rule?.enabled) attach(rule)
      return { rules }
    })
}))

