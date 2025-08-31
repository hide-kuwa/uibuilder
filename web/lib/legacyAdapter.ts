import type { InstanceLike, OverrideOp } from '@/types/instanceLike'

export function toInstanceLike(n: any): InstanceLike {
  const meta = (n.meta || {}) as any
  const actions = (n.actions || meta.actions || undefined) as any
  const variant = (n.variant ?? meta.variant ?? null) as string | null
  const overrides = (n.overrides ?? meta.overrides ?? undefined) as OverrideOp[] | undefined
  return {
    id: String(n.id),
    componentId: String(n.componentId || n.type || n.key || n.code?.key || ''),
    props: n.props || {},
    propValues: n.propValues || {},
    variant,
    overrides,
    actions,
    x: typeof n.x === 'number' ? n.x : undefined,
    y: typeof n.y === 'number' ? n.y : undefined,
    w: typeof n.w === 'number' ? n.w : undefined,
    h: typeof n.h === 'number' ? n.h : undefined,
    name: n.name,
    parentId: n.parentId ?? null,
    children: Array.isArray(n.children) ? n.children : [],
  }
}
