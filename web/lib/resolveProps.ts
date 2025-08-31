import type { InstanceLike, VariantDef } from '@/types/instanceLike'
import { applyOverrides } from '@/lib/ovr'

export type BindingValue = { source: 'data'; path: string }

function isBinding(v: any): v is BindingValue {
  return v && typeof v === 'object' && v.source === 'data' && typeof v.path === 'string'
}

function resolveBinding(props: any) {
  const walk = (val: any): any => {
    if (Array.isArray(val)) return val.map(walk)
    if (isBinding(val)) return undefined
    if (val && typeof val === 'object') {
      const out: any = {}
      for (const k of Object.keys(val)) out[k] = walk(val[k])
      return out
    }
    return val
  }
  return walk(props)
}

export function resolveProps(opts: {
  defDefault?: Record<string, any>
  variants?: VariantDef[]
  inst: InstanceLike
}) {
  const base = { ...(opts.defDefault||{}) }
  const variant = opts.inst.variant ? (opts.variants||[]).find(v=>v.id===opts.inst.variant) : undefined
  let merged = { ...base, ...(variant?.props||{}), ...(opts.inst.props||{}), ...(opts.inst.propValues||{}) }
  if (variant?.className) merged.className = [merged.className, variant.className].filter(Boolean).join(' ')
  if (variant?.style) merged.style = { ...(merged.style||{}), ...variant.style }
  merged = applyOverrides(merged, opts.inst.overrides)
  merged = resolveBinding(merged)
  return merged
}
