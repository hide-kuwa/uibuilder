'use client';
import { useBuilderStore } from '@/stores/builder';
import Link from 'next/link';
import ArrangeCanvas from './ArrangeCanvas';

export default function ArrangePage() {
  const updateMany = useBuilderStore((s) => s.updateMany);
  const publishAll = useBuilderStore((s) => s.publishAll);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Arrange</h1>
        <div className="flex gap-2">
          <button onClick={publishAll} className="px-3 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black">Publish</button>
          <Link href="/map" className="px-3 py-2 rounded-lg border">/map</Link>
          <Link href="/map?preview=1" className="px-3 py-2 rounded-lg border">/map?preview=1</Link>
        </div>
      </div>

      <ArrangeCanvas onSave={(nodes) => updateMany(nodes)} />
    </div>
  );
}


