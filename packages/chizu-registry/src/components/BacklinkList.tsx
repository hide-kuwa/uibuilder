// packages/chizu-registry/src/components/BacklinkList.tsx
'use client';
import React, { useMemo } from 'react';
import { useLineage } from '@chizu/ui/hooks/useLineage';
import type { LineageGraph } from '@chizu/types/lineage';

type Props = {
  title?: string;
  selectedId?: string;
  onSelect?: (id: string) => void;
};

function bfsUp(graph: LineageGraph, start: string) {
  const up: string[] = [];
  const seen = new Set<string>([start]);
  let q = [start];
  while (q.length) {
    const cur = q.shift()!;
    graph.edges
      .filter((e) => e.to === cur)
      .forEach((e) => {
        if (!seen.has(e.from)) {
          seen.add(e.from);
          up.push(e.from);
          q.push(e.from);
        }
      });
  }
  return up;
}
function bfsDown(graph: LineageGraph, start: string) {
  const down: string[] = [];
  const seen = new Set<string>([start]);
  let q = [start];
  while (q.length) {
    const cur = q.shift()!;
    graph.edges
      .filter((e) => e.from === cur)
      .forEach((e) => {
        if (!seen.has(e.to)) {
          seen.add(e.to);
          down.push(e.to);
          q.push(e.to);
        }
      });
  }
  return down;
}

export function BacklinkList({ title = 'Backlinks', selectedId, onSelect }: Props) {
  const { data } = useLineage();
  const up = useMemo(() => (data && selectedId ? bfsUp(data, selectedId) : []), [data, selectedId]);
  const down = useMemo(() => (data && selectedId ? bfsDown(data, selectedId) : []), [data, selectedId]);

  if (!data) return <div className="text-sm text-gray-500">Loading lineage…</div>;
  if (!selectedId) return <div className="text-sm text-gray-500">ノードを選択してください</div>;

  const nodeLabel = (id: string) => data.nodes[id]?.label ?? id;

  return (
    <div className="space-y-3">
      <div className="font-medium">{title}</div>
      <section>
        <div className="text-xs font-semibold opacity-70 mb-1">上流（{up.length}）</div>
        <ul className="space-y-1">
          {up.map((id) => (
            <li key={`up-${id}`}>
              <button
                className="text-sm underline underline-offset-2 hover:opacity-80"
                onClick={() => onSelect?.(id)}
                type="button"
              >
                {nodeLabel(id)}
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <div className="text-xs font-semibold opacity-70 mb-1">下流（{down.length}）</div>
        <ul className="space-y-1">
          {down.map((id) => (
            <li key={`down-${id}`}>
              <button
                className="text-sm underline underline-offset-2 hover:opacity-80"
                onClick={() => onSelect?.(id)}
                type="button"
              >
                {nodeLabel(id)}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

