// apps/preview/app/reco-events/page.tsx
'use client';
import React from 'react';

export default function Page() {
  const [logs, setLogs] = React.useState<string[]>([]);
  React.useEffect(() => {
    const onAny = (e: Event) => {
      const ce = e as CustomEvent;
      setLogs((prev) => [`${e.type} ${JSON.stringify(ce.detail)}`, ...prev].slice(0, 200));
    };
    const types = ['reco', 'reco:confirmed', 'reco:tolerance'];
    // append-only: ensure formal names are listened
    types.push('reco:confirmed', 'reco:tolerance')
    types.forEach(t => window.addEventListener(t, onAny as any));
    return () => types.forEach(t => window.removeEventListener(t, onAny as any));
  }, []);
  return (
    <main className="p-4">
      <h1 className="font-semibold mb-2">Reco Events</h1>
      <ol className="text-sm space-y-1">{logs.map((l,i)=><li key={i}>{l}</li>)}</ol>
    </main>
  );
}
