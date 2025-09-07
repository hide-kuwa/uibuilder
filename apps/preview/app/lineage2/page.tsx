// apps/preview/app/lineage2/page.tsx
'use client';
import React from 'react';
import { BacklinkList } from '@chizu/registry';
import { NodeInspectorV2 } from '@chizu/registry';

export default function Page() {
  const [sel, setSel] = React.useState('sheet:交際費集計');
  return (
    <main className="p-6 grid grid-cols-2 gap-8">
      <BacklinkList title="被リンク（V2検証）" selectedId={sel} onSelect={setSel} />
      <NodeInspectorV2 selectedId={sel} />
    </main>
  );
}

