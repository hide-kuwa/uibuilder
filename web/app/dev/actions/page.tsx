'use client';

import Link from 'next/link';
import { useBuilderStore } from '@/stores/builder';
import { useCanvasStore } from '@/stores/canvas';

export default function DevActionsPage() {
  const nodes = useBuilderStore((s) => s.nodes);
  const publishAll = useBuilderStore((s) => s.publishAll);
  const setNodeStatus = useBuilderStore((s) => s.setNodeStatus);
  const setSelectedIds = useCanvasStore((s) => s.setSelectedIds);

  const allNodeIds = nodes.map((n) => n.id);

  const selectAll = () => setSelectedIds(allNodeIds);
  const resetStatuses = () => {
    allNodeIds.forEach((id) =>
      setNodeStatus(id, { base: 'notVisited', overlays: [] })
    );
  };

  const links = [
    { href: '/map', label: '/map' },
    { href: '/map?preview=1', label: '/map?preview=1' },
    { href: '/builder', label: '/builder' },
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">/dev/actions</h1>
        <Link href="/dev/pages" className="text-sm underline">
          /dev/pages
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <button
          onClick={publishAll}
          className="p-4 rounded-xl border hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          Publish All
        </button>
        <button
          onClick={selectAll}
          className="p-4 rounded-xl border hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          全選択
        </button>
        <button
          onClick={resetStatuses}
          className="p-4 rounded-xl border hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          ステータス初期化
        </button>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="p-4 rounded-xl border hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center justify-center"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

