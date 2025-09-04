'use client';

import Link from 'next/link';
import { registry } from '@/lib/registry';
import { useBuilderStore } from '@/store/builderStore';

export default function DevUnusedPage() {
  const elements = useBuilderStore((s) => s.elements);
  const allIds = Object.keys(registry);
  const usedIds = new Set(
    elements.map((el) => el.componentId).filter((id): id is string => Boolean(id))
  );
  const unusedIds = allIds.filter((id) => !usedIds.has(id));

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">/dev/unused</h1>
      {unusedIds.length > 0 ? (
        <ul className="list-disc pl-5 space-y-1">
          {unusedIds.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      ) : (
        <p>未使用なし</p>
      )}
      <Link href="/dev/pages" className="text-blue-500 underline">
        戻る
      </Link>
    </div>
  );
}

