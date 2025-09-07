// apps/preview/app/lineage/page.tsx
'use client';
import React from 'react';
import { BacklinkList } from '@chizu/registry';
import { NodeInspector } from '@chizu/registry';

export default function LineagePreviewPage() {
  const [sel, setSel] = React.useState<string>('sheet:交際費集計');
  return (
    <main className="p-6 grid grid-cols-2 gap-8">
      <section>
        <BacklinkList title="被リンク" selectedId={sel} onSelect={setSel} />
      </section>
      <section>
        <NodeInspector selectedId={sel} />
      </section>
    </main>
  );
}

