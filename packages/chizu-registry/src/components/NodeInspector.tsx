// packages/chizu-registry/src/components/NodeInspector.tsx
'use client';
import React, { useMemo } from 'react';
import { useLineage } from '@chizu/ui/hooks/useLineage';

type Props = { selectedId?: string; showRounding?: boolean };

export function NodeInspector({ selectedId, showRounding = true }: Props) {
  const { data } = useLineage();
  if (!data) return <div className="text-sm text-gray-500">Loading…</div>;
  if (!selectedId) return <div className="text-sm text-gray-500">ノードを選択してください</div>;

  const meta = data.nodes[selectedId];
  if (!meta) return <div className="text-sm text-red-500">未登録ノード: {selectedId}</div>;

  const connected = useMemo(
    () => data.edges.filter((e) => e.from === selectedId || e.to === selectedId),
    [data, selectedId]
  );
  const flagsAgg = connected.reduce(
    (acc, e) => {
      acc.rounded ||= !!e.flags?.rounded;
      acc.taxAdjust ||= !!e.flags?.taxAdjust;
      acc.manualAdjust ||= !!e.flags?.manualAdjust;
      return acc;
    },
    { rounded: false, taxAdjust: false, manualAdjust: false }
  );

  return (
    <div className="space-y-2 text-sm">
      <div className="font-semibold">Node Inspector</div>
      <div><span className="opacity-60">ID：</span>{meta.id}</div>
      <div><span className="opacity-60">Label：</span>{meta.label ?? '-'}</div>
      <div><span className="opacity-60">Kind：</span>{meta.kind}</div>
      {meta.tags?.length ? <div><span className="opacity-60">Tags：</span>{meta.tags.join(', ')}</div> : null}
      {showRounding && (
        <div className="pt-2">
          <div className="opacity-60 text-xs">Flags</div>
          <ul className="list-disc list-inside">
            <li>rounded: {String(flagsAgg.rounded)}</li>
            <li>taxAdjust: {String(flagsAgg.taxAdjust)}</li>
            <li>manualAdjust: {String(flagsAgg.manualAdjust)}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

