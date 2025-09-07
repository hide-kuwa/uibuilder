// apps/preview/app/autosave-events/page.tsx
'use client';
import React from 'react';

export default function Page() {
  const [logs, setLogs] = React.useState<string[]>([]);
  React.useEffect(() => {
    const push = (t:string) => (e: Event) => {
      const d = (e as CustomEvent).detail ?? null;
      setLogs((prev)=> [`${t} ${JSON.stringify(d)}`, ...prev].slice(0,200));
    };
    const m = {
      'autosave:queued': push('autosave:queued'),
      'autosave:saved':  push('autosave:saved'),
      'autosave:error':  push('autosave:error'),
    } as const;
    Object.entries(m).forEach(([k,h]) => window.addEventListener(k, h as any));
    return () => Object.entries(m).forEach(([k,h]) => window.removeEventListener(k, h as any));
  }, []);
  return (
    <main className="p-4">
      <h1 className="font-semibold mb-2">Autosave Events</h1>
      <ol className="text-sm space-y-1">{logs.map((l,i)=><li key={i}>{l}</li>)}</ol>
    </main>
  );
}

