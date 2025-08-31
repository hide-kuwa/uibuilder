import type { ComponentType } from 'react'
import type { BuilderMeta } from '@/types/propertySchema'

export type VariantDef = {
  id: string
  label: string
  props: Record<string, any>
  className?: string
  style?: Record<string, any>
}

export type ComponentDef = {
  key: string
  displayName: string
  cmp: ComponentType<any>
  defaultProps?: Record<string, any>
  variants?: VariantDef[]
  meta: BuilderMeta
}
