export interface PropMeta {
  name: string
  type: string
  required: boolean
  defaultValue?: string
  description: string
  group?: string
}

export function groupProps(props: PropMeta[]): Record<string, PropMeta[]> {
  return props.reduce<Record<string, PropMeta[]>>((acc, prop) => {
    const group = prop.group || 'General'
    if (!acc[group]) acc[group] = []
    acc[group].push(prop)
    return acc
  }, {})
}
