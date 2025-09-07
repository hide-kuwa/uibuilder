// apps/preview/app/exports-check2/page.tsx
'use client';
import React from 'react';
import * as R from '@chizu/registry';

const mustBeFns = [
  'Text', 'Image', 'Hero', 'TopNav', 'PrefList',
  'Frame_Basic', 'Frame_Toponly', 'Frame_TopOnly', 'Frame_Wide',
];

export default function Page() {
  const report = mustBeFns.map((k) => [k, typeof (R as any)[k]] as const);
  return (
    <main className="p-6 text-sm space-y-2">
      <div className="font-semibold">Registry namespace smoke</div>
      <ul className="list-disc list-inside">
        {report.map(([k,t]) => (
          <li key={k} className={t==='function' ? 'text-green-700' : 'text-red-600'}>
            {k}: {t}
          </li>
        ))}
      </ul>
    </main>
  );
}

