'use client';

import Link from 'next/link';
import { useBuilderStore } from '@/stores/builder';
import { downloadJson } from '@/lib/download';

export default function DevExportPage() {
  const { nodes, statuses, statusConfig, publishedSnapshot } = useBuilderStore((s) => ({
    nodes: s.nodes,
    statuses: s.statuses,
    statusConfig: s.statusConfig,
    publishedSnapshot: s.publishedSnapshot,
  }));

  const saveDraft = () => {
    downloadJson(`draft-${Date.now()}.json`, {
      nodes,
      statuses,
      statusConfig,
    });
  };

  const savePublished = () => {
    if (!publishedSnapshot) return;
    downloadJson(`published-${Date.now()}.json`, publishedSnapshot);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">/dev/export</h1>
        <Link href="/dev/pages" className="text-sm text-blue-500 underline">
          /dev/pages
        </Link>
      </div>

      <div className="max-w-sm p-4 rounded-xl border space-y-4">
        <button
          type="button"
          onClick={saveDraft}
          className="px-4 py-2 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Draft を保存
        </button>
        <button
          type="button"
          onClick={savePublished}
          disabled={!publishedSnapshot}
          className="px-4 py-2 text-sm font-medium rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
        >
          Published を保存
        </button>
      </div>
    </div>
  );
}

