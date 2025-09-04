'use client';
import { useSearchParams } from 'next/navigation';
import { useState, useRef, useLayoutEffect } from 'react';
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

function NodeCard({
  node,
  faded,
  onHover,
  onMove,
  onLeave,
  onToggle,
}: {
  node: MapNode;
  faded?: boolean;
  onHover: (id: string, x: number, y: number) => void;
  onMove: (id: string, x: number, y: number) => void;
  onLeave: () => void;
  onToggle: (id: string, x: number, y: number) => void;
}) {
  const cfg = useBuilderStore((s) => s.statusConfig);
  const getStatus = useBuilderStore((s) => s.getNodeStatus);
  const status = getStatus(node.id);
  const { bg, filter } = computeBgColor(status, cfg);
  const baseLabel = cfg.base[status.base]?.label ?? status.base;
  const overlayLabels = status.overlays
    .map((k) => cfg.overlays.find((o) => o.key === k)?.label ?? k)
    .join(' ');
  const ariaLabel = `${node.name ?? node.id} status ${baseLabel}${
    overlayLabels ? ` ${overlayLabels}` : ''
  }`;

  return (
    <div
      className={`rounded-xl p-4 border text-sm shadow-sm transition-[filter,opacity] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
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
      tabIndex={0}
      role="button"
      aria-label={ariaLabel}
      onMouseEnter={(e) => onHover(node.id, e.clientX, e.clientY)}
      onMouseMove={(e) => onMove(node.id, e.clientX, e.clientY)}
      onMouseLeave={onLeave}
      onClick={(e) => onToggle(node.id, e.clientX, e.clientY)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const rect = e.currentTarget.getBoundingClientRect();
          onToggle(node.id, rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
      }}
      onBlur={onLeave}
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

  const tipRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    id: string | null;
    content: React.ReactNode | null;
  }>({ visible: false, x: 0, y: 0, id: null, content: null });

  const clamp = (x: number, y: number) => {
    const el = tipRef.current;
    const w = el?.offsetWidth ?? 0;
    const h = el?.offsetHeight ?? 0;
    const nx = Math.min(Math.max(8, x), window.innerWidth - w - 8);
    const ny = Math.min(Math.max(8, y), window.innerHeight - h - 8);
    return { x: nx, y: ny };
  };

  const showTip = (id: string, x: number, y: number) => {
    const status = getNodeStatus(id);
    const baseCfg = cfg.base[status.base];
    const content = (
      <div>
        <table className="text-xs">
          <tbody>
            <tr>
              <td className="pr-2">base</td>
              <td>{baseCfg.label}</td>
            </tr>
            {status.overlays.map((k) => {
              const oc = cfg.overlays.find((o) => o.key === k);
              return (
                <tr key={k}>
                  <td className="pr-2">{oc?.label ?? k}</td>
                  <td>
                    p{oc?.priority}/{oc?.mode}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
    const pos = clamp(x + 8, y + 8);
    setTip({ visible: true, x: pos.x, y: pos.y, id, content });
  };

  const moveTip = (id: string, x: number, y: number) => {
    setTip((prev) => {
      if (!prev.visible || prev.id !== id) return prev;
      const pos = clamp(x + 8, y + 8);
      return { ...prev, x: pos.x, y: pos.y };
    });
  };

  const hideTip = () => setTip((p) => ({ ...p, visible: false }));

  const toggleTip = (id: string, x: number, y: number) => {
    setTip((prev) => {
      if (prev.visible && prev.id === id) return { ...prev, visible: false };
      const status = getNodeStatus(id);
      const baseCfg = cfg.base[status.base];
      const content = (
        <div>
          <table className="text-xs">
            <tbody>
              <tr>
                <td className="pr-2">base</td>
                <td>{baseCfg.label}</td>
              </tr>
              {status.overlays.map((k) => {
                const oc = cfg.overlays.find((o) => o.key === k);
                return (
                  <tr key={k}>
                    <td className="pr-2">{oc?.label ?? k}</td>
                    <td>
                      p{oc?.priority}/{oc?.mode}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      const pos = clamp(x + 8, y + 8);
      return { visible: true, x: pos.x, y: pos.y, id, content };
    });
  };

  useLayoutEffect(() => {
    if (!tip.visible) return;
    const pos = clamp(tip.x, tip.y);
    if (pos.x !== tip.x || pos.y !== tip.y) {
      setTip((prev) => ({ ...prev, x: pos.x, y: pos.y }));
    }
  }, [tip.x, tip.y, tip.visible]);

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
          return (
            <NodeCard
              key={node.id}
              node={node}
              faded={!match && showNonMatch}
              onHover={showTip}
              onMove={moveTip}
              onLeave={hideTip}
              onToggle={toggleTip}
            />
          );
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
      {tip.visible && (
        <div
          ref={tipRef}
          role="dialog"
          aria-live="polite"
          className="pointer-events-none fixed z-50 border rounded bg-white text-xs shadow p-2"
          style={{ left: tip.x, top: tip.y }}
        >
          {tip.content}
        </div>
      )}
    </div>
  );
}

