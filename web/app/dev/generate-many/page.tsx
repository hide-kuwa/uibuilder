'use client';

import Link from 'next/link';
import { useBuilderStore } from '@/stores/builder';
import { newId } from '@/lib/ids';
import type { BaseKind, OverlayKind } from '@/types/status';

export default function DevGenerateManyPage() {
  const { setNodes, updateMany, setNodeStatus } = useBuilderStore((s) => ({
    setNodes: s.setNodes,
    updateMany: s.updateMany,
    setNodeStatus: s.setNodeStatus,
  }));

  const generate = () => {
    const nodes = Array.from({ length: 200 }, (_, i) => ({
      id: newId('n'),
      name: `node-${i + 1}`,
      x: Math.round(Math.random() * 800),
      y: Math.round(Math.random() * 600),
      w: 80,
      h: 80,
    }));

    setNodes(nodes);
    updateMany(nodes);

    const bases: BaseKind[] = ['visited', 'live', 'notVisited'];
    nodes.forEach((n) => {
      const base = bases[Math.floor(Math.random() * bases.length)];
      const overlays: OverlayKind[] = [];
      if (Math.random() < 0.3) overlays.push('want');
      if (Math.random() < 0.2) overlays.push('photo');
      setNodeStatus(n.id, { base, overlays });
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">/dev/generate-many</h1>
        <Link href="/dev/pages" className="text-sm text-blue-500 underline">
          /dev/pages
        </Link>
      </div>
      <div className="space-y-4">
        <button
          type="button"
          onClick={generate}
          className="px-4 py-2 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          生成
        </button>
        <Link href="/map?preview=1" className="block text-sm text-blue-500 underline">
          /map?preview=1
        </Link>
      </div>
    </div>
  );
}

