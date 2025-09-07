// apps/preview/app/tracegraph2/page.tsx
'use client';
import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BacklinkList, NodeInspectorV2 } from '@chizu/registry';

export default function TraceGraphUrlSync() {
  const sp = useSearchParams();
  const router = useRouter();
  const initial = sp.get('sel') ?? 'sheet:交際費集計';
  const [sel, setSel] = React.useState(initial);

  React.useEffect(() => {
    const p = new URLSearchParams(Array.from(sp.entries()));
    p.set('sel', sel);
    router.replace(`?${p.toString()}`, { scroll: false });
  }, [sel, router, sp]);

  return (
    <main className="p-6 grid grid-cols-2 gap-8">
      <BacklinkList title="被リンク（URL同期）" selectedId={sel} onSelect={setSel} />
      <NodeInspectorV2 selectedId={sel} />
    </main>
  );
}

