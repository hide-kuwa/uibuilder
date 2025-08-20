export interface PropBinding {
  source: string
  endpoint: string
  path: string
  fallback?: string
}

export interface VariantStyle {
  className?: string
}

export interface Variants {
  hover?: VariantStyle
}

export interface IRComponentNode {
  id: string
  type: string
  props?: Record<string, any>
  bindings?: Record<string, PropBinding>
  variants?: Variants
  children?: IRComponentNode[]
}
