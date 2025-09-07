// apps/preview/app/tracegraph/page.tsx
'use client';
import React from 'react';
import { TraceGraph } from '@chizu/registry';

export default function Page() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-lg font-semibold">TraceGraph Preview</h1>
      <TraceGraph highlightPath={["tb:交際費", "sheet:交際費集計", "calc:否認額"]} />
    </main>
  );
}

