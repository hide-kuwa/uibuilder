'use client';
import Link from 'next/link';
import { mergeMenu } from '@/lib/menu';
import { useSidebarStore } from '@/store/sidebarStore';
import type { NestedMenuItem } from '../../../src/lib/router/scanRoutes';
import { useRbacStore, type FeatureKey } from '../../../src/stores/rbacStore';

function NodeView({ n }: { n: NestedMenuItem }) {
  if (n.hidden) return null;
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
          {n.children.map((c) => <NodeView key={c.id} n={c} />)}
        </ul>
      ) : null}
    </li>
  );
}

interface SidebarProps {
  menuItems?: NestedMenuItem[];
  useAuto?: boolean;
  rbacKeys?: Record<string, FeatureKey>;
}

export default function Sidebar({ menuItems = [], useAuto = true, rbacKeys }: SidebarProps) {
  const preset = useSidebarStore(s => s.active());
  const { role, permissions, locks } = useRbacStore();

  const applyRbac = (nodes: NestedMenuItem[]): NestedMenuItem[] =>
    nodes.map(n => {
      const key = rbacKeys?.[n.href];
      const allowed = key ? permissions[role][key] : true;
      const unlocked = key ? locks[key] : true;
      const children = n.children ? applyRbac(n.children) : undefined;
      return {
        ...n,
        hidden: n.hidden || !allowed,
        disabled: n.disabled || !unlocked,
        children,
      };
    });

  let tree: NestedMenuItem[] = useAuto ? (mergeMenu(preset) as NestedMenuItem[]) : menuItems;
  tree = applyRbac(tree);

  if (useAuto && preset.rootHidden) return null;

  return (
    <aside className="w-64 shrink-0 border-r" style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}>
      <div className="p-3 text-xs uppercase tracking-wide text-[color:var(--muted)]">Menu</div>
      <ul className="px-2 pb-4 space-y-1">
        {tree.map((n) => <NodeView key={n.id} n={n} />)}
      </ul>
    </aside>
  );
}
