'use client';
import { useSearchParams } from 'next/navigation';
import { useBuilderStore } from '@/stores/builder';
import { computeBgColor } from '@/lib/status-engine';
import ZoomPanCanvas from '@/components/canvas/ZoomPanCanvas';
import type { BaseKind, OverlayKind } from '@/types/status';

type MapNode = {
  id: string;
  name?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
};

const BASE_LABELS: Record<BaseKind, string> = {
  visited: '🏠 行った',
  live: '🧍‍♂️ 住んでる',
  notVisited: '❌ 行ってない',
};

const OVERLAY_LABELS: Record<OverlayKind, string> = {
  want: '✈️ 行きたい',
  photo: '📷 写真あり',
};

function NodeCard({ node }: { node: MapNode }) {
  const cfg = useBuilderStore((s) => s.statusConfig);
  const getStatus = useBuilderStore((s) => s.getNodeStatus);
  const { bg, filter } = computeBgColor(getStatus(node.id), cfg);

  return (
    <div
      className="rounded-xl p-4 border text-sm shadow-sm transition-[filter]"
      style={{
        position: 'absolute',
        left: node.x,
        top: node.y,
        width: node.w,
        height: node.h,
        background: bg,
        filter,
      }}
    >
      <div className="font-semibold">{node.name ?? node.id}</div>
      <div className="opacity-70 text-xs">id: {node.id}</div>
    </div>
  );
}

export default function MapPage() {
  const sp = useSearchParams();
  const preview = sp.get('preview') === '1';
  const getMapNodes = useBuilderStore((s) => s.getMapNodes);
  const nodes = getMapNodes(preview);
  const cfg = useBuilderStore((s) => s.statusConfig);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">/map {preview ? '(preview)' : '(published)'}</h1>
      </div>
      <ZoomPanCanvas className="w-full h-[1000px]">
        {nodes.map((n) => (
          <NodeCard key={n.id} node={n} />
        ))}
      </ZoomPanCanvas>
      <div className="fixed bottom-4 left-4 bg-white/80 p-4 rounded-xl shadow text-sm space-y-1">
        {Object.entries(cfg.base).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: v.color }}
            />
            <span>{BASE_LABELS[k as BaseKind]}</span>
          </div>
        ))}
        {cfg.overlays.map((o) => (
          <div key={o.key} className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: o.color }}
            />
            <span>{OVERLAY_LABELS[o.key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

