'use client';
import { useSearchParams } from 'next/navigation';
import { useBuilderStore } from '@/stores/builder';
import { computeBgColor, buildMotionFromStatus } from '@/lib/status-engine';
import { animate } from 'animejs';
import { useEffect, useRef } from 'react';

function Card({ id, title }: { id: string; title?: string }) {
  const cfg = useBuilderStore((s) => s.statusConfig);
  const status = useBuilderStore((s) => s.getNodeStatus(id));
  const ref = useRef<HTMLDivElement | null>(null);
  const { bg, filter } = computeBgColor(status, cfg);
  const motion = buildMotionFromStatus(status, cfg);

  useEffect(() => {
    if (!ref.current || !motion) return;
    const anim = animate({ targets: ref.current, ...motion });
    return () => anim.pause();
  }, [motion]);

  return (
    <div
      ref={ref}
      className="rounded-xl p-4 border text-sm shadow-sm transition-[filter]"
      style={{ background: bg, filter }}
    >
      <div className="font-semibold">{title ?? id}</div>
      <div className="opacity-70 text-xs">id: {id}</div>
    </div>
  );
}

export default function MapPage() {
  const sp = useSearchParams();
  const preview = sp.get('preview') === '1';
  const getMapNodes = useBuilderStore((s) => s.getMapNodes);
  const nodes = getMapNodes(preview);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">/map {preview ? '(preview)' : '(published)'}</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {nodes.map((n) => (
          <Card key={n.id} id={n.id} title={n.name} />
        ))}
      </div>
    </div>
  );
}

