import type { HoverEffect } from '../types/interactions'

const shadowMap = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const

const esc = (id: string) => CSS.escape(id)

export function buildHoverCss(nodeId: string, effects: HoverEffect[] = [], transitionMs = 120) {
  if (!effects.length) return ''
  let decls: string[] = []
  let transforms: string[] = []

  for (const ef of effects) {
    switch (ef.kind) {
      case 'bgColor':
        decls.push(`background-color:${ef.value} !important`)
        break
      case 'textColor':
        decls.push(`color:${ef.value} !important`)
        break
      case 'borderColor':
        decls.push(`border-color:${ef.value} !important`)
        break
      case 'shadow':
        decls.push(`box-shadow:${shadowMap[ef.value]} !important`)
        break
      case 'scale':
        transforms.push(`scale(${ef.value})`)
        break
      case 'opacity':
        decls.push(`opacity:${ef.value}`)
        break
      case 'translate':
        transforms.push(`translate(${ef.x ?? 0}px, ${ef.y ?? 0}px)`)
        break
      case 'rotate':
        transforms.push(`rotate(${ef.deg}deg)`)
        break
      case 'outline':
        decls.push(`outline:${ef.width}px ${ef.style ?? 'solid'} ${ef.color}`)
        decls.push('outline-offset:0')
        break
      case 'cursor':
        decls.push(`cursor:${ef.value}`)
        break
    }
  }
  if (transforms.length) decls.push(`transform:${transforms.join(' ')} !important`)
  decls.push(`transition: all ${transitionMs}ms cubic-bezier(.2,.8,.2,1)`)

  return `[data-node-id="${esc(nodeId)}"]:hover{${decls.join(';')}}`
}
