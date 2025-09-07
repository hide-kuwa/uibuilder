// apps/preview/app/reco2/page.tsx
'use client';
import React from 'react';
import { RecoPanel } from '@chizu/registry';
import { computeMatches } from '@chizu/ui/reco/match';

export default function Page() {
  const left = [
    { id: 'L1', amount: 12000, memo: '会食 〇〇商事' },
    { id: 'L2', amount: 8000, memo: '接待 △△物産' }
  ];
  const right = [
    { id: 'R7', amount: 12000, memo: '〇〇 商事' },
    { id: 'R9', amount: 7800, memo: '打合せ' }
  ];
  const matches = computeMatches(left as any, right as any, { amountTolerance: 200 });
  const [confirmed, setConfirmed] = React.useState<string[]>([]);
  return (
    <main className="p-6 space-y-3">
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

