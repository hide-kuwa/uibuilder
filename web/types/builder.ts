import type { ZodTypeAny } from 'zod'

export type JSONSchema = { [key: string]: any }

export type BuilderNodeMeta = {
  displayName: string
  icon?: string
  defaultSize?: { w: number; h: number }
  resizable?: boolean
  snap?: 'grid' | 'guides' | 'none'
  allowChildren?: boolean
  slots?: string[]
  propertySchema?: ZodTypeAny | JSONSchema
  events?: string[]
}
