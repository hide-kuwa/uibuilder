import { encodeActionRules } from '../actions/serialize'
import { serializeNodeAppendOnly } from './serializeNode.append'
import type { ActionRule } from '../actions/types'

export type SerializableNode = {
  id: string
  type: string
  props?: Record<string, any>
  children?: SerializableNode[]
  textContent?: string
  interactions?: ActionRule[]
}

const renderValue = (value: any): string | null => {
  if (value == null) return null
  if (typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'number' || typeof value === 'boolean') return `{${JSON.stringify(value)}}`
  return `{${JSON.stringify(value)}}`
}

const cloneProps = (props?: Record<string, any>) => {
  if (!props || typeof props !== 'object') return undefined
  const entries = Object.entries(props)
  if (!entries.length) return undefined
  const out: Record<string, any> = {}
  entries.forEach(([key, value]) => {
    out[key] = value
  })
  return out
}

const renderProps = (node: SerializableNode): string[] => {
  const attrs: string[] = []
  attrs.push(`key=${JSON.stringify(node.id)}`)
  attrs.push(`data-node-id=${JSON.stringify(node.id)}`)
  const rules = node.interactions
  if (rules?.length) attrs.push(`data-int=${JSON.stringify(encodeActionRules(rules))}`)
  if (node.props) {
    const keys = Object.keys(node.props)
    keys.sort()
    keys.forEach((key) => {
      const rendered = renderValue((node.props as any)[key])
      if (rendered != null) attrs.push(`${key}=${rendered}`)
    })
  }
  return attrs
}

const indent = (level: number) => ' '.repeat(level)

export function serializeNode(node: SerializableNode, level = 0): string {
  serializeNodeAppendOnly(node)
  // append-only: serialize pre-hook
  const props = renderProps(node)
  const pad = indent(level)
  const open = `<${node.type}${props.length ? ' ' + props.join(' ') : ''}`
  const children: string[] = []
  const innerPad = indent(level + 2)
  if (node.textContent != null) children.push(`${innerPad}{${JSON.stringify(node.textContent)}}`)
  if (node.children?.length) {
    node.children.forEach((child) => {
      children.push(serializeNode(child, level + 2))
    })
  }
  if (!children.length) return `${pad}${open} />`
  const body = children.join('\n')
  return `${pad}${open}>\n${body}\n${pad}</${node.type}>`
}

export function serializeNodes(nodes: SerializableNode[], level = 0): string {
  return nodes.map((node) => serializeNode(node, level)).join('\n')
}

export function normalizeNode(input: any): SerializableNode {
  const id = typeof input?.id === 'string' ? input.id : String(input?.id ?? 'node')
  const type = typeof input?.type === 'string' ? input.type : 'div'
  const props = cloneProps(input?.props)

  const rawInteractions = Array.isArray(input?.interactions)
    ? (input.interactions as ActionRule[])
    : Array.isArray(props?.interactions)
    ? (props.interactions as ActionRule[])
    : Array.isArray(props?.$interactions)
    ? (props.$interactions as ActionRule[])
    : undefined
  if (props) {
    delete (props as any).interactions
    delete (props as any).$interactions
  }

  const interactions = rawInteractions
    ?.map((rule) => ({ ...rule, sourceId: rule.sourceId ?? id }))

  const text =
    typeof input?.textContent === 'string'
      ? input.textContent
      : typeof input?.text === 'string'
      ? input.text
      : undefined

  const children = Array.isArray(input?.children)
    ? (input.children as any[]).map((child) => normalizeNode(child))
    : undefined

  return {
    id,
    type,
    props,
    textContent: text,
    children,
    interactions,
  }
}

export function normalizeNodes(input: any): SerializableNode[] {
  if (Array.isArray(input)) return input.map((item) => normalizeNode(item))
  if (Array.isArray(input?.tree)) return input.tree.map((item: any) => normalizeNode(item))
  return []
}




