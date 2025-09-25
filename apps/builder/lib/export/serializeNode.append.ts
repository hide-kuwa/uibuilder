import type { SerializableNode } from './serializeNode'

function ensureSlotClass(node: SerializableNode) {
  const slot = (node as any)?.meta?.slot
  if (!slot || typeof slot !== 'string' || !slot.trim()) return
  const props = (node.props ||= {})
  const existing = typeof props.className === 'string' ? props.className : ''
  const tokens = existing.split(/\s+/).filter(Boolean)
  if (!tokens.includes(slot)) tokens.push(slot)
  if (!tokens.length) return
  tokens.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
  props.className = tokens.join(' ')
}

export function serializeNodeAppendOnly(node: SerializableNode): void {
  ensureSlotClass(node)
}
