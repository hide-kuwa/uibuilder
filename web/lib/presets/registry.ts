import meta from '../../../component-meta.json'

type PropMeta = {
  name: string
  type: string
  required?: boolean
  description?: string
  default?: unknown
  group?: string
}

type ComponentPresetMeta = {
  displayName: string
  description?: string
  props: PropMeta[]
}

export const library: ComponentPresetMeta[] = (meta as ComponentPresetMeta[]).map((entry) => ({
  ...entry,
  props: Array.isArray(entry.props) ? entry.props : [],
}))
