import type { InstanceLike, VariantDef } from '@/types/instanceLike'
import { applyOverrides } from '@/lib/ovr'
import { resolveBinding } from '@/lib/resolveBinding'
import { resolveTokenRefs } from '@/lib/resolveTokens'

export function resolveProps(opts: {
  defDefault?: Record<string, any>
  variants?: VariantDef[]
  inst: InstanceLike
}) {
  const base = { ...(opts.defDefault || {}) }
  const variant = opts.inst.variant ? (opts.variants || []).find(v => v.id === opts.inst.variant) : undefined
  let merged = { ...base, ...(variant?.props || {}), ...(opts.inst.props || {}), ...(opts.inst.propValues || {}) }
  if (variant?.className) merged.className = [merged.className, variant.className].filter(Boolean).join(' ')
  if (variant?.style) merged.style = { ...(merged.style || {}), ...variant.style }
  merged = applyOverrides(merged, opts.inst.overrides)
  merged = resolveBinding(merged)
  merged = resolveTokenRefs(merged)
  return merged
}
