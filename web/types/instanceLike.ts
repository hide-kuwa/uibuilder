export type VariantDef = { id: string; label: string; props?: Record<string, any>; className?: string; style?: React.CSSProperties }
export type OverrideOp = { op: 'setProp'; path: string; value: any } | { op: 'mergeStyle'; value: React.CSSProperties } | { op: 'appendClass'; value: string }
export type Action = { type: 'openUrl'; url: string; target?: '_self'|'_blank' } | { type: 'navigate'; path: string }
export type ActionMap = { onClick?: Action[] }
export type InstanceLike = {
  id: string
  componentId: string
  props?: Record<string, any>
  propValues?: Record<string, any>
  variant?: string | null
  overrides?: OverrideOp[]
  actions?: ActionMap
  x?: number
  y?: number
  w?: number
  h?: number
  name?: string
  parentId?: string | null
  children?: any[]
}
