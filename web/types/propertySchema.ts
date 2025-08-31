export type PropKind = 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'color'
export type Option = { label: string; value: string }
export type PropertyDef = {
  id: string
  label: string
  kind: PropKind
  default?: any
  options?: Option[]
  min?: number
  max?: number
  step?: number
  placeholder?: string
  group?: string
  bindable?: boolean
}
export type BuilderMeta = {
  displayName: string
  icon?: string
  propertySchema: PropertyDef[]
}
