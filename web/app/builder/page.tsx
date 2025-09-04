'use client';
import StatusConfigPanel from '@/components/panels/StatusConfigPanel';
import StatusDropdown from '@/components/panels/StatusDropdown';
import { useBuilderStore } from '@/stores/builder';
import Link from 'next/link';

export default function BuilderPage() {
  const nodes = useBuilderStore((s) => s.nodes);
  const publishAll = useBuilderStore((s) => s.publishAll);
  const usePublished = useBuilderStore((s) => s.usePublishedOnMap);
  const setUsePublished = useBuilderStore((s) => s.setUsePublishedOnMap);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Builder</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={usePublished} onChange={(e) => setUsePublished(e.target.checked)} />
            <span>/map は公開版を使用</span>
          </label>
          <button onClick={publishAll} className="px-3 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black">
            Publish All
          </button>
          <Link href="/map" className="px-3 py-2 rounded-lg border">/map</Link>
          <Link href="/map?preview=1" className="px-3 py-2 rounded-lg border">/map?preview=1</Link>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-4">
          <div className="text-sm text-zinc-500">ノードごとのステータス編集</div>
          <div className="grid grid-cols-2 gap-4">
            {nodes.map((n) => (
              <div key={n.id} className="p-3 rounded-xl border bg-white/70 dark:bg-zinc-900/70">
                <div className="mb-2 text-sm font-medium">{n.name ?? n.id}</div>
                <StatusDropdown nodeId={n.id} />
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-4">
          <StatusConfigPanel />
        </div>
      </div>
    </div>
  );
}

