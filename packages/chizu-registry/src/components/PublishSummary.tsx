// packages/chizu-registry/src/components/PublishSummary.tsx
'use client';
import React from 'react';

export function PublishSummary({
  flags, onLockToggle,
}: { flags: { rounded?: boolean; taxAdjust?: boolean; manualAdjust?: boolean };
     onLockToggle?: (next: 'Draft'|'Published')=>void }) {
  const [state, setState] = React.useState<'Draft'|'Published'>('Draft');
  return (
    <div className="space-y-2 text-sm">
      <div className="font-semibold">Publish Summary</div>
      <ul className="list-disc list-inside">
        <li>rounded: {String(!!flags.rounded)}</li>
        <li>taxAdjust: {String(!!flags.taxAdjust)}</li>
        <li>manualAdjust: {String(!!flags.manualAdjust)}</li>
      </ul>
      <div className="pt-2">
        <button className="underline" onClick={()=>{
          const next = state === 'Draft' ? 'Published' : 'Draft';
          setState(next); onLockToggle?.(next);
        }}>
          切替: {state} → {state === 'Draft' ? 'Published' : 'Draft'}
        </button>
      </div>
    </div>
  );
}

