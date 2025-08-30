export type BuilderNodeMeta = {
  displayName: string
  icon?: string
  defaultSize?: { w: number; h: number }
  resizable?: boolean
  snap?: 'grid' | 'guides' | 'none'
  allowChildren?: boolean
  slots?: string[]
  propertySchema?: any
  events?: string[]
}
