'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { perfMetrics } from '../../../lib/perf/metrics';

export default function PerfPage() {
  const [commits, setCommits] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    perfMetrics.reset();
    const id = setInterval(() => {
      setCommits(perfMetrics.commitCount);
      setTime(perfMetrics.renderTime);
    }, 500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">/dev/perf</h1>
        <Link href="/dev/pages" className="text-sm text-blue-500 underline">
          /dev/pages
        </Link>
      </div>
      <div>Commit count: {commits}</div>
      <div>Total render time: {time.toFixed(2)}ms</div>
    </div>
  );
}
