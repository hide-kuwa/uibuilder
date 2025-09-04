'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useBuilderStore } from '@/stores/builder';
import { loadSnapshots, saveSnapshots, type Snapshot } from '@/lib/snapshots';

export default function DevSnapshotsPage() {
  const {
    publishedSnapshot,
    updateMany,
    setNodeStatus,
    setStatusConfig,
  } = useBuilderStore((s) => ({
    publishedSnapshot: s.publishedSnapshot,
    updateMany: s.updateMany,
    setNodeStatus: s.setNodeStatus,
    setStatusConfig: s.setStatusConfig,
  }));

  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

  useEffect(() => {
    setSnapshots(loadSnapshots());
  }, []);

  const saveCurrent = () => {
    if (!publishedSnapshot) return;
    const next = [...snapshots, publishedSnapshot].slice(-10);
    setSnapshots(next);
    saveSnapshots(next);
  };

  const restore = (snap: Snapshot) => {
    updateMany(
      snap.nodes.map((n) => ({ id: n.id, x: n.x, y: n.y, w: n.w, h: n.h }))
    );
    Object.entries(snap.statuses).forEach(([id, st]) => setNodeStatus(id, st));
    setStatusConfig((draft) => Object.assign(draft, snap.statusConfig));
  };

  const list = [...snapshots].reverse();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">/dev/snapshots</h1>
        <Link href="/dev/pages" className="text-sm text-blue-500 underline">
          /dev/pages
        </Link>
      </div>

      <div className="space-y-4 max-w-md">
        <button
          type="button"
          onClick={saveCurrent}
          disabled={!publishedSnapshot}
          className="px-4 py-2 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          現在の publishedSnapshot を履歴に保存
        </button>

        <ul className="space-y-3">
          {list.map((snap, i) => (
            <li
              key={snap.at + '-' + i}
              className="p-4 rounded-xl border flex items-center justify-between"
            >
              <div>
                <div className="font-medium">
                  {new Date(snap.at).toLocaleString()}
                </div>
                <div className="text-xs text-zinc-500">{snap.nodes.length} 件</div>
              </div>
              <button
                type="button"
                onClick={() => restore(snap)}
                className="px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
              >
                この履歴を復元
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

