// packages/chizu-registry/src/components/RecoPanel.tsx
'use client';
import React from 'react';

type Row = { id: string; amount: number; memo?: string };
type Match = { leftId: string; rightId: string; score: number };

export function RecoPanel({
  left, right, matches, onConfirm,
}: {
  left: Row[]; right: Row[]; matches: Match[];
  onConfirm?: (m: Match)=>void
}) {
  const [confirmed, setConfirmed] = React.useState<Set<string>>(new Set());
  const confirm = (m: Match) => {
    const key = `${m.leftId}-${m.rightId}`;
    setConfirmed(s => new Set(s).add(key));
    onConfirm?.(m);
  };
  return (
    <div className="text-sm space-y-2">
      <div className="font-semibold">照合候補</div>
      <ul className="space-y-1">
        {matches.map(m => {
          const key = `${m.leftId}-${m.rightId}`;
          const done = confirmed.has(key);
          return (
            <li key={key} className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-gray-100">{m.score.toFixed(2)}</span>
              <span>{m.leftId} ↔ {m.rightId}</span>
              {done ? (
                <span className="text-green-600">確定済</span>
              ) : (
                <button className="underline" onClick={()=>confirm(m)} type="button">確定</button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

