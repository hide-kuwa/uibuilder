import type { Effect, InteractionPreset, Trigger } from '@/types/interactions'

const shadowMap = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const

const safeEscape = (s: string) => {
  try {
    // @ts-ignore
    if (typeof CSS !== 'undefined' && CSS?.escape) return CSS.escape(s)
  } catch {}
  // フォールバック：CSSセレクタで問題になる文字をエスケープ
  return s.replace(/[^a-zA-Z0-9_-]/g, (m) => `\\${m}`)
}
const GATE = '[data-actions-enabled="true"]'

function target(nodeId: string) {
  return `${GATE} [data-node-id="${safeEscape(nodeId)}"]:not([data-interacting="true"])`
}

function effectsToDecls(effects: Effect[], transitionMs = 120, easing = 'cubic-bezier(.2,.8,.2,1)') {
  const decls: string[] = []
  const tf: string[] = []
  for (const ef of effects) {
    switch (ef.kind) {
      case 'bgColor':     decls.push(`background-color:${ef.value} !important`); break
      case 'textColor':   decls.push(`color:${ef.value} !important`); break
      case 'borderColor': decls.push(`border-color:${ef.value} !important`); break
      case 'shadow':      decls.push(`box-shadow:${shadowMap[ef.value]} !important`); break
      case 'scale':       tf.push(`scale(${ef.value})`); break
      case 'opacity':     decls.push(`opacity:${ef.value}`); break
      case 'translate':   tf.push(`translate(${ef.x ?? 0}px, ${ef.y ?? 0}px)`); break
      case 'rotate':      tf.push(`rotate(${ef.deg}deg)`); break
      case 'outline':     decls.push(`outline:${ef.width}px ${ef.style ?? 'solid'} ${ef.color}`); decls.push('outline-offset:0'); break
      case 'cursor':      decls.push(`cursor:${ef.value}`); break
    }
  }
  if (tf.length) decls.push(`transform:${tf.join(' ')} !important`)
  decls.push(`transition: all ${transitionMs}ms ${easing}`)
  return decls.join(';')
}

function triggerSelector(nodeId: string, t: Trigger) {
  const base = target(nodeId)
  switch (t) {
    case 'hover':
      return `${base}:hover`
    case 'active':
      return `${base}:active`
    case 'focus':
      return `${base}:focus`
    case 'focusWithin':
      return `${base}:focus-within`
    case 'groupHover':
      return `${GATE} .group:hover [data-node-id="${safeEscape(nodeId)}"]:not([data-interacting="true"])`
  }
}

export function buildPresetCss(nodeId: string, preset: InteractionPreset) {
  if (!preset.effects?.length || !preset.triggers?.length) return ''
  const decls = effectsToDecls(preset.effects, preset.transitionMs ?? 120, preset.easing ?? 'cubic-bezier(.2,.8,.2,1)')
  return preset.triggers.map(t => `${triggerSelector(nodeId, t)}{${decls}}`).join('\n')
}

export function buildCombinedCss(nodeId: string, presets: InteractionPreset[] = [], inlineHoverEffects?: Effect[], inlineMs?: number) {
  let css = ''
  for (const p of presets) css += buildPresetCss(nodeId, p) + '\n'
  // 後方互換：旧「hoverEffects」をプリセットと合成
  if (inlineHoverEffects?.length) {
    const decls = effectsToDecls(inlineHoverEffects, inlineMs ?? 120)
    css += `${triggerSelector(nodeId,'hover')}{${decls}}\n`
  }
  return css
}
