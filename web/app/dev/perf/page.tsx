'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function DevPerfPage() {
  const renderCount = useRef(0);
  renderCount.current += 1;

  const [fps, setFps] = useState(0);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    let rafId: number;

    const loop = (now: number) => {
      frame += 1;
      const delta = now - last;
      if (delta >= 1000) {
        setFps((frame * 1000) / delta);
        frame = 0;
        last = now;
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">/dev/perf</h1>
        <Link href="/dev/pages" className="text-sm text-blue-500 underline">
          /dev/pages
        </Link>
      </div>

      <div className="space-y-2">
        <div>レンダ回数: {renderCount.current}</div>
        <div>FPS: {fps.toFixed(1)}</div>
        <p className="text-xs text-zinc-500">
          本番最適化目的の参考値。数値は目安です。
        </p>
      </div>
    </div>
  );
}

