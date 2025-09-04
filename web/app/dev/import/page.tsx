'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useBuilderStore } from '@/stores/builder';

function validate(json: any) {
  if (typeof json !== 'object' || json === null) return false;
  const { nodes, statuses, statusConfig } = json as any;

  if (!Array.isArray(nodes)) return false;
  if (
    nodes.some(
      (n) =>
        typeof n !== 'object' ||
        typeof n.id !== 'string' ||
        typeof n.x !== 'number' ||
        typeof n.y !== 'number' ||
        typeof n.w !== 'number' ||
        typeof n.h !== 'number',
    )
  )
    return false;

  if (typeof statuses !== 'object' || statuses === null || Array.isArray(statuses)) return false;
  if (
    Object.values(statuses).some(
      (s: any) =>
        typeof s !== 'object' ||
        typeof s.base !== 'string' ||
        !Array.isArray(s.overlays) ||
        s.overlays.some((o: any) => typeof o !== 'string'),
    )
  )
    return false;

  if (
    statusConfig !== undefined &&
    (typeof statusConfig !== 'object' || statusConfig === null || Array.isArray(statusConfig))
  )
    return false;

  return true;
}

export default function DevImportPage() {
  const setNodes = useBuilderStore((s) => s.setNodes);
  const setStatusConfig = useBuilderStore((s) => s.setStatusConfig);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!validate(data)) {
        setError('読み込んだJSONが不正です');
        setMessage(null);
        return;
      }
      const { nodes, statuses, statusConfig } = data;
      setNodes(nodes);
      useBuilderStore.setState({ statuses: statuses || {} });
      if (statusConfig) {
        setStatusConfig(() => statusConfig);
      }
      setMessage('インポートに成功しました');
      setError(null);
    } catch (err) {
      console.error(err);
      setError('インポートに失敗しました');
      setMessage(null);
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
        {error && <p className="text-sm text-red-500">{error}</p>}
        {message && <p className="text-sm">{message}</p>}
      </div>
    </div>
  );
}

