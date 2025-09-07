// apps/preview/app/reco/page.tsx
'use client';
import React from 'react';
import { RecoPanel } from '@chizu/registry';

export default function Page() {
  const left = [
    { id: 'L-001', amount: 12000 },
    { id: 'L-002', amount: 8000 },
  ];
  const right = [
    { id: 'R-101', amount: 12000 },
    { id: 'R-102', amount: 8000 },
  ];
  const matches = [
    { leftId: 'L-001', rightId: 'R-101', score: 0.98 },
    { leftId: 'L-002', rightId: 'R-102', score: 0.95 },
  ];
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-lg font-semibold">RecoPanel Preview</h1>
      <RecoPanel left={left as any} right={right as any} matches={matches} />
    </main>
  );
}

