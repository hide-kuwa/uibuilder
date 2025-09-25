import type { ActionPreset, Effect, Trigger } from './types'

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
    else if (ef.kind === 'translate')
      transforms.push(`translate(${ef.x ?? 0}px, ${ef.y ?? 0}px)`)
    else if (ef.kind === 'rotate') transforms.push(`rotate(${ef.deg}deg)`)
    else if (ef.kind === 'outline') {
      decls.push(
        `outline:${ef.width}px ${ef.style ?? 'solid'} ${ef.color}`,
      )
      decls.push('outline-offset:0')
    } else if (ef.kind === 'cursor') decls.push(`cursor:${ef.value}`)
  }

  if (transforms.length) {
    decls.push(`transform:${transforms.join(' ')} !important`)
  }
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

function buildCombinedCss(nodeId: string, presets: ActionPreset[] = []) {
  if (!Array.isArray(presets)) return ''
  return presets
    .map((preset) => buildPresetCss(nodeId, preset))
    .filter(Boolean)
    .join('\n')
}

type Binding = {
  update: (presets: ActionPreset[]) => void
  destroy: () => void
}

export class ActionEngine {
  static bind(root: HTMLElement, opts: { nodeId: string; presets?: ActionPreset[] }): Binding {
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
}

export { buildCombinedCss }
