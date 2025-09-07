// apps/preview/app/dev/pages/page.tsx
'use client';
import React from 'react';
import Link from 'next/link';

const links = [
  { href: '/exports-check', label: 'exports-check' },
  { href: '/lineage', label: 'lineage' },
  { href: '/lineage2', label: 'lineage2 (V2)' },
  { href: '/gridsheet', label: 'gridsheet' },
  { href: '/gridsheet2', label: 'gridsheet2 (V2)' },
  { href: '/tracegraph', label: 'tracegraph' },
  { href: '/reco', label: 'reco' },
  { href: '/publish-summary', label: 'publish-summary' },
  { href: '/reco2', label: 'reco2' },
  { href: '/publish-summary2', label: 'publish-summary2' },
  { href: '/exports-check2', label: 'exports-check2' },
];

export default function Page() {
  return (
    <main className="p-6">
      <h1 className="text-lg font-semibold mb-4">Dev Links</h1>
      <ul className="list-disc list-inside space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link className="underline" href={l.href}>{l.label}</Link>
          </li>
        ))}
      </ul>
      {/* --- append-only: link to reco3 --- */}
      <div className="mt-2 text-sm">
        <a href="/reco3" className="underline">/reco3</a>
      </div>
      {/* --- append-only: link to reco-events --- */}
      <div className="mt-2 text-sm">
        <a className="underline" href="/reco-events">/reco-events</a>
      </div>
      {/* --- append-only: link to autosave-events --- */}
      <div className="mt-2 text-sm">
        <a className="underline" href="/autosave-events">/autosave-events</a>
      </div>
    </main>
  );
}
