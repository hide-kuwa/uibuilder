'use client';
import { useMemo } from 'react';
import { useBuilderStore } from '@/stores/builder';
import type { BaseKind, OverlayKind } from '@/types/status';

export default function StatusDropdown({ nodeId }: { nodeId: string }) {
  const status = useBuilderStore((s) => s.getNodeStatus(nodeId));
  const cfg = useBuilderStore((s) => s.statusConfig);
  const setNodeStatus = useBuilderStore((s) => s.setNodeStatus);

  const baseOptions = useMemo(
    () => Object.entries(cfg.base) as [BaseKind, { label: string; color: string }][],
    [cfg]
  );

  const onToggleOverlay = (key: OverlayKind) => {
    const set = new Set(status.overlays);
    if (set.has(key)) set.delete(key);
    else set.add(key);
    setNodeStatus(nodeId, { ...status, overlays: [...set] });
  };

  const onChangeBase = (base: BaseKind) => setNodeStatus(nodeId, { ...status, base });

  return (
    <div className="flex flex-col gap-2 p-2 rounded-lg border bg-white/80 dark:bg-zinc-900/80">
      <div className="text-xs font-semibold text-zinc-500">ステータス</div>
      <div className="flex gap-2">
        {baseOptions.map(([key, v]) => (
          <button
            key={key}
            onClick={() => onChangeBase(key)}
            className={`px-2 py-1 rounded border text-xs ${status.base === key ? 'ring-2 ring-offset-1' : ''}`}
            style={{ backgroundColor: v.color }}
            aria-pressed={status.base === key}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="text-xs font-semibold text-zinc-500 mt-2">オーバーレイ</div>
      <div className="flex gap-2 flex-wrap">
        {cfg.overlays.map((o) => {
          const active = status.overlays.includes(o.key as OverlayKind);
          return (
            <button
              key={o.key}
              onClick={() => onToggleOverlay(o.key as OverlayKind)}
              className={`px-2 py-1 rounded border text-xs ${active ? 'ring-2 ring-offset-1' : ''}`}
              style={{ backgroundColor: o.color }}
              aria-pressed={active}
              title={`mode:${o.mode} prio:${o.priority}`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

