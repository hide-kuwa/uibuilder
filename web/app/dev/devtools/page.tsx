'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const ReactQueryDevtools = dynamic(
  () => import('@tanstack/react-query-devtools').then((mod) => mod.ReactQueryDevtools),
  { ssr: false }
);

export default function DevtoolsPage() {
  const [showRQ, setShowRQ] = useState(false);
  const [showZustand, setShowZustand] = useState(false);

  useEffect(() => {
    if (showRQ) {
      const isDark = document.documentElement.classList.contains('dark');
      try {
        localStorage.setItem(
          'TanstackQueryDevtools.theme_preference',
          isDark ? 'dark' : 'light'
        );
      } catch (_) {
        // ignore
      }
    }
  }, [showRQ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Devtools</h1>
        <Link href="/dev/pages" className="text-sm text-blue-600 hover:underline">
          ← /dev/pages
        </Link>
      </div>

      <p className="text-sm text-zinc-500">React Query Devtools や Zustand Devtools を表示します。</p>

      <div className="space-y-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showRQ}
            onChange={(e) => setShowRQ(e.target.checked)}
          />
          <span>React Query Devtools</span>
        </label>
        {showRQ && <ReactQueryDevtools initialIsOpen={false} />}

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showZustand}
            onChange={(e) => setShowZustand(e.target.checked)}
          />
          <span>Zustand Devtools</span>
        </label>
        {showZustand && (
          <div className="text-xs text-zinc-500">後日追加</div>
        )}
      </div>
    </div>
  );
}
