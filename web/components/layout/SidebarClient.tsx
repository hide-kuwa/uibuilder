'use client'

import Link from 'next/link'
import { useRbacStore, FeatureKey } from '../../../src/stores/rbacStore'
import type { NestedMenuItem } from '../../../src/lib/router/scanRoutes'

interface Props {
  items: NestedMenuItem[]
  rbacKeys?: Record<string, FeatureKey>
}

function applyRbac(
  items: NestedMenuItem[],
  rbacKeys: Record<string, FeatureKey> | undefined,
  role: string,
  permissions: any,
  locks: Record<FeatureKey, boolean>
): NestedMenuItem[] {
  const walk = (arr: NestedMenuItem[]): NestedMenuItem[] =>
    arr
      .map((n) => {
        const key = rbacKeys?.[n.id]
        let hidden = n.hidden
        let disabled = n.disabled
        if (key) {
          const allowed = permissions[role]?.[key]
          const unlocked = locks[key]
          if (!allowed) hidden = true
          else if (!unlocked) disabled = true
        }
        const children = n.children ? walk(n.children) : undefined
        return { ...n, hidden, disabled, children }
      })
      .filter((n) => !n.hidden)
  return walk(items)
}

function NodeView({ n }: { n: NestedMenuItem }) {
  return (
    <li>
      <Link
        href={n.href}
        className={`block px-3 py-1.5 rounded hover:bg-[color:var(--panel2)] ${n.disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {n.label}
      </Link>
      {n.children?.length ? (
        <ul className="ml-3 border-l border-[color:var(--border)] pl-2 space-y-1">
          {n.children.map((c) => (
            <NodeView key={c.id} n={c} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export default function SidebarClient({ items, rbacKeys }: Props) {
  const { role, permissions, locks } = useRbacStore()
  const tree = applyRbac(items, rbacKeys, role, permissions, locks)

  return (
    <aside className="w-64 shrink-0 border-r" style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}>
      <div className="p-3 text-xs uppercase tracking-wide text-[color:var(--muted)]">Menu</div>
      <ul className="px-2 pb-4 space-y-1">
        {tree.map((n) => (
          <NodeView key={n.id} n={n} />
        ))}
      </ul>
    </aside>
  )
}
