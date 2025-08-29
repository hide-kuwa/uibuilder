import type { Effect, InteractionPreset, Trigger } from '@/types/interactions'

const shadowMap = {
  sm:'0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md:'0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg:'0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl:'0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const

const esc = (s:string) => { try { /* @ts-ignore */ return CSS?.escape ? CSS.escape(s) : s } catch { return s } }

function effectsToDecls(effects: Effect[], ms=120, easing='cubic-bezier(.2,.8,.2,1)') {
  const decls:string[] = [], tf:string[] = []
  for (const ef of effects) {
    if (ef.kind==='bgColor')     decls.push(`background-color:${ef.value} !important`)
    else if (ef.kind==='textColor')   decls.push(`color:${ef.value} !important`)
    else if (ef.kind==='borderColor') decls.push(`border-color:${ef.value} !important`)
    else if (ef.kind==='shadow')      decls.push(`box-shadow:${shadowMap[ef.value]} !important`)
    else if (ef.kind==='scale')       tf.push(`scale(${ef.value})`)
    else if (ef.kind==='opacity')     decls.push(`opacity:${ef.value}`)
    else if (ef.kind==='translate')   tf.push(`translate(${ef.x ?? 0}px, ${ef.y ?? 0}px)`)
    else if (ef.kind==='rotate')      tf.push(`rotate(${ef.deg}deg)`)
    else if (ef.kind==='outline')     { decls.push(`outline:${ef.width}px ${ef.style ?? 'solid'} ${ef.color}`); decls.push('outline-offset:0') }
    else if (ef.kind==='cursor')      decls.push(`cursor:${ef.value}`)
  }
  if (tf.length) decls.push(`transform:${tf.join(' ')} !important`)
  decls.push(`transition: all ${ms}ms ${easing}`)
  return decls.join(';')
}

function rule(nodeId:string, t:Trigger, decls:string) {
  const base = `[data-node-id="${esc(nodeId)}"]`
  const sel = t==='hover' ? `${base}:hover`
    : t==='active' ? `${base}:active`
    : t==='focus' ? `${base}:focus`
    : t==='focusWithin' ? `${base}:focus-within`
    : `.group:hover ${base}`
  return `${sel}{${decls}}`
}

export function buildPresetCss(id:string, p:InteractionPreset) {
  if (!p.effects?.length || !p.triggers?.length) return ''
  const decls = effectsToDecls(p.effects, p.transitionMs ?? 120, p.easing ?? 'cubic-bezier(.2,.8,.2,1)')
  return p.triggers.map(t => rule(id, t, decls)).join('\n')
}

export function buildCombinedCss(id:string, presets:InteractionPreset[] = [], inline?:Effect[], ms?:number) {
  let css = ''; for (const p of presets) css += buildPresetCss(id, p) + '\n'
  if (inline?.length) css += rule(id, 'hover', effectsToDecls(inline, ms ?? 120)) + '\n'
  return css
}

