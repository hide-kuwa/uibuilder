'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useBuilderStore } from '@/stores/builder';
import type { NodeStatus } from '@/types/status';

export default function DevImportPage() {
  const updateMany = useBuilderStore((s) => s.updateMany);
  const setNodeStatus = useBuilderStore((s) => s.setNodeStatus);
  const setStatusConfig = useBuilderStore((s) => s.setStatusConfig);
  const [message, setMessage] = useState<string | null>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const { nodes, statuses, statusConfig } = data;
      updateMany(nodes);
      Object.entries(statuses || {}).forEach(([id, status]) => {
        setNodeStatus(id, status as NodeStatus);
      });
      if (statusConfig) {
        setStatusConfig((draft) => Object.assign(draft, statusConfig));
      }
      setMessage('インポートに成功しました');
    } catch (err) {
      console.error(err);
      setMessage('インポートに失敗しました');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">/dev/import</h1>
        <Link href="/dev/pages" className="text-sm text-blue-500 underline">
          /dev/pages
        </Link>
      </div>
      <div className="max-w-sm p-4 rounded-xl border space-y-4">
        <input type="file" accept="application/json" onChange={onFile} />
        {message && <p className="text-sm">{message}</p>}
      </div>
    </div>
  );
}

