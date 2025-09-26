import type { ComponentNode } from '@chizu/types'

export type InstantiateCtx = {
  parentId?: string
  index?: number
  slotId?: string
}

let seq = 0
const newId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  seq += 1
  return `node_${seq.toString(36)}`
}

export function instantiatePaletteId(id: string, _ctx?: InstantiateCtx): ComponentNode {
  switch (id) {
    case 'frame':
      return {
        id: newId(),
        type: 'frame',
        props: { w: 320, h: 200 },
        children: [],
      }
    case 'text':
      return {
        id: newId(),
        type: 'text',
        props: { text: 'Text', size: 16 },
      }
    case 'image':
      return {
        id: newId(),
        type: 'image',
        props: { src: '', alt: '', w: 160, h: 120 },
      }
    case 'button':
      return {
        id: newId(),
        type: 'button',
        props: { label: 'Button' },
      }
    default:
      return {
        id: newId(),
        type: 'frame',
        props: { w: 200, h: 160 },
        children: [],
      }
  }
}
