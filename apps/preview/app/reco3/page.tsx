// apps/preview/app/reco3/page.tsx
'use client';
import React from 'react';
import { RecoPanel } from '@chizu/registry';
import { computeMatches } from '@chizu/ui/reco/match';
import { projectRows } from '@chizu/ui/reco/adapter';

type DomainRow = { id: string; total: number; note?: string };

export default function Page() {
  const leftDom: DomainRow[] = [
    { id: 'L-1001', total: 12000, note: '会食 〇〇商事' },
    { id: 'L-1002', total: 8000, note: '接待 △△物産' },
  ];
  const rightDom: DomainRow[] = [
    { id: 'R-2101', total: 12000, note: '〇〇 商事' },
    { id: 'R-2109', total: 7800, note: '打合せ' },
  ];

  const left = projectRows(leftDom, { id: 'id', amount: 'total', memo: 'note' });
  const right = projectRows(rightDom, { id: 'id', amount: 'total', memo: 'note' });
  const matches = computeMatches(left as any, right as any, { amountTolerance: 200 });

  const [confirmed, setConfirmed] = React.useState<string[]>([]);
  return (
    <main className="p-6 space-y-3">
      <h1 className="text-lg font-semibold">RecoPanel (adapter + matcher)</h1>
      <RecoPanel
        left={left as any}
        right={right as any}
        matches={matches}
        onConfirm={(m: any) => setConfirmed((s)=>[...s, `${m.leftId}-${m.rightId}`])}
      />
      <div className="text-xs opacity-70">確定: {confirmed.join(', ') || 'なし'}</div>
    </main>
  );
}

