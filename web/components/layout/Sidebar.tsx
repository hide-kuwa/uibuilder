'use client';
import Link from 'next/link';
import { mergeMenu } from '@/lib/menu';
import { useSidebarStore } from '@/store/sidebarStore';

function NodeView({ n }: { n: any }) {
  if (n.hidden) return null;
  return (
    <li>
      <Link href={n.href} className="block px-3 py-1.5 rounded hover:bg-[color:var(--panel2)]">
        {n.label}
      </Link>
      {n.children?.length ? (
        <ul className="ml-3 border-l border-[color:var(--border)] pl-2 space-y-1">
          {n.children.map((c: any) => <NodeView key={c.id} n={c} />)}
        </ul>
      ) : null}
    </li>
  );
}

export default function Sidebar() {
  const preset = useSidebarStore(s => s.active());
  if (preset.rootHidden) return null;
  const tree = mergeMenu(preset);

  return (
    <aside className="w-64 shrink-0 border-r"
           style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}>
      <div className="p-3 text-xs uppercase tracking-wide text-[color:var(--muted)]">Menu</div>
      <ul className="px-2 pb-4 space-y-1">
        {tree.map((n) => <NodeView key={n.id} n={n} />)}
      </ul>
    </aside>
  );
}
