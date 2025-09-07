// apps/preview/app/exports-check/page.tsx
'use client';
import React from 'react';
// subpath exports 経由の実行時解決を検証
import { useLineage } from '@chizu/ui/hooks/useLineage';
import { BacklinkList } from '@chizu/registry/components/BacklinkList';
import { NodeInspector } from '@chizu/registry/components/NodeInspector';

export default function ExportsCheckPage() {
  const [sel, setSel] = React.useState('sheet:交際費集計');
  const { data, error } = useLineage();
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-lg font-semibold">Subpath exports runtime check</h1>
      <div className="text-sm opacity-80">
        {error ? 'error' : data ? 'ok' : 'loading…'}
      </div>
      <div className="grid grid-cols-2 gap-8">
        <BacklinkList selectedId={sel} onSelect={setSel} />
        <NodeInspector selectedId={sel} />
      </div>
    </main>
  );
}

