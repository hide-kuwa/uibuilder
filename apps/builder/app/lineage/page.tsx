// apps/builder/app/lineage/page.tsx
'use client';
import React from 'react';
import { BacklinkList, NodeInspector } from '@chizu/registry';

export default function BuilderLineageSandbox() {
  const [sel, setSel] = React.useState<string>('sheet:交際費集計');
  return (
    <main className="p-6 grid grid-cols-2 gap-8">
      <section>
        <BacklinkList title="被リンク（Builder内サンドボックス）" selectedId={sel} onSelect={setSel} />
      </section>
      <section>
        <NodeInspector selectedId={sel} />
      </section>
    </main>
  );
}

