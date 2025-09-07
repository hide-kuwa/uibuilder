// apps/preview/app/publish-summary2/page.tsx
'use client';
import React from 'react';
import { useLineage } from '@chizu/ui/hooks/useLineage';
import { aggregateFlags } from '@chizu/ui/lineage/flags';
import { PublishSummary } from '@chizu/registry';

export default function Page() {
  const { data } = useLineage();
  const nodeId = 'sheet:交際費集計';
  const flags = data ? aggregateFlags(data as any, nodeId) : { rounded:false, taxAdjust:false, manualAdjust:false };
  return (
    <main className="p-6 space-y-3">
      <PublishSummary flags={flags} onLockToggle={()=>{}} />
    </main>
  );
}

