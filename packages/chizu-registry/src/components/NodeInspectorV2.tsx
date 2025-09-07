// packages/chizu-registry/src/components/NodeInspectorV2.tsx
'use client';
import React, { useMemo } from 'react';
import type { LineageGraph, LineageEdge } from '@chizu/types/lineage';
import { useLineage } from '@chizu/ui/hooks/useLineage';

type Props = { selectedId?: string; showRounding?: boolean };
type FlagAgg = { rounded: boolean; taxAdjust: boolean; manualAdjust: boolean };

export function NodeInspectorV2({ selectedId, showRounding = true }: Props) {
  const { data } = useLineage();
  if (!data) return <div className="text-sm text-gray-500">Loading…</div>;
  if (!selectedId) return <div className="text-sm text-gray-500">ノードを選択してください</div>;

  const meta = data.nodes[selectedId];
  if (!meta) return <div className="text-sm text-red-500">未登録ノード: {selectedId}</div>;

  const connected = useMemo<LineageEdge[]>(
    () => data.edges.filter((edge: LineageEdge) => edge.from === selectedId || edge.to === selectedId),
    [data, selectedId]
  );

  const flagsAgg = connected.reduce<FlagAgg>(
    (acc, edge) => ({
      rounded: acc.rounded || !!edge.flags?.rounded,
      taxAdjust: acc.taxAdjust || !!edge.flags?.taxAdjust,
      manualAdjust: acc.manualAdjust || !!edge.flags?.manualAdjust,
    }),
    { rounded: false, taxAdjust: false, manualAdjust: false }
  );

  return (
    <div className="space-y-2 text-sm">
      <div className="font-semibold">Node Inspector V2</div>
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

