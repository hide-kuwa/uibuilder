'use client';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
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

function NodeCard({ node, faded }: { node: MapNode; faded?: boolean }) {
  const cfg = useBuilderStore((s) => s.statusConfig);
  const getStatus = useBuilderStore((s) => s.getNodeStatus);
  const { bg, filter } = computeBgColor(getStatus(node.id), cfg);

  return (
    <div
      className={`rounded-xl p-4 border text-sm shadow-sm transition-[filter,opacity] ${
        faded ? 'opacity-30' : ''
      }`}
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
  const getNodeStatus = useBuilderStore((s) => s.getNodeStatus);
  const nodes = getMapNodes(preview);
  const cfg = useBuilderStore((s) => s.statusConfig);

  const [keyword, setKeyword] = useState('');
  const [base, setBase] = useState<BaseKind | 'all'>('all');
  const [overlays, setOverlays] = useState<OverlayKind[]>([]);
  const [showNonMatch, setShowNonMatch] = useState(false);

  const toggleOverlay = (o: OverlayKind) =>
    setOverlays((cur) =>
      cur.includes(o) ? cur.filter((c) => c !== o) : [...cur, o]
    );

  const mapped = nodes.map((n) => {
    const status = getNodeStatus(n.id);
    const name = (n.name ?? n.id).toLowerCase();
    const kw = keyword.toLowerCase();
    const matchKeyword = kw === '' || name.includes(kw);
    const matchBase = base === 'all' || status.base === base;
    const matchOverlay = overlays.every((o) => status.overlays.includes(o));
    const match = matchKeyword && matchBase && matchOverlay;
    return { node: n, match };
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">/map {preview ? '(preview)' : '(published)'}</h1>
      </div>
      <div className="space-y-2">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="キーワード"
          className="border px-2 py-1 rounded"
        />
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'visited', 'live', 'notVisited'] as const).map((b) => (
            <label key={b} className="flex items-center gap-1">
              <input
                type="radio"
                name="base"
                value={b}
                checked={base === b}
                onChange={() => setBase(b as BaseKind | 'all')}
              />
              <span>{b === 'live' ? 'resident' : b}</span>
            </label>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(['want', 'photo'] as OverlayKind[]).map((o) => (
            <label key={o} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={overlays.includes(o)}
                onChange={() => toggleOverlay(o)}
              />
              <span>{o === 'photo' ? 'hasPhotos' : o}</span>
            </label>
          ))}
        </div>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={showNonMatch}
            onChange={(e) => setShowNonMatch(e.target.checked)}
          />
          <span>非該当は半透明</span>
        </label>
      </div>
      <ZoomPanCanvas className="w-full h-[1000px]">
        {mapped.map(({ node, match }) => {
          if (!showNonMatch && !match) return null;
          return <NodeCard key={node.id} node={node} faded={!match && showNonMatch} />;
        })}
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

