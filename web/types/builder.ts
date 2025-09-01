import type { ReactNode } from 'react'

export type PropControl = 'text' | 'number' | 'color' | 'select' | 'switch' | 'json' | 'component'

export type PropMeta<T = unknown> = {
  id: string
  label: string
  control: PropControl
  default: T
  options?: { label: string; value: any }[]
  min?: number
  max?: number
  step?: number
}

export type ComponentMeta = {
  id: string
  displayName: string
  group?: string
  icon?: string
  props: PropMeta[]
  allowChildren?: boolean
  preferredSize?: { width: number; height: number }
}

export type RendererProps = {
  nodeId: string
  values: Record<string, any>
  children?: ReactNode
}

export type ComponentDef = {
  meta: ComponentMeta
  Render: (p: RendererProps) => JSX.Element | null
}

export type ComponentRegistry = Record<string, ComponentDef>
