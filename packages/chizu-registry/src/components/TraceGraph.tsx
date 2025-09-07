// packages/chizu-registry/src/components/TraceGraph.tsx
'use client';
import React, { useMemo } from 'react';
import { useLineage } from '@chizu/ui/hooks/useLineage';
import type { LineageGraph, LineageEdge } from '@chizu/types/lineage';

type Props = {
  highlightPath?: string[];
};

export function TraceGraph({ highlightPath = [] }: Props) {
  const { data } = useLineage();
  if (!data) return <div className="text-sm text-gray-500">Loading lineage…</div>;

  // groups by groupId (fallback to 'ungrouped')
  const groups = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const id of Object.keys(data.nodes)) {
      const gid = data.nodes[id]?.groupId || 'ungrouped';
      if (!m.has(gid)) m.set(gid, []);
      m.get(gid)!.push(id);
    }
    // stable order by groupId
    return Array.from(m.entries()).map(([gid, ids]) => ({ gid, ids }));
  }, [data]);

  const colCount = groups.length || 1;
  const itemH = 44;
  const vGap = 12;
  const colPad = 12;

  // map id -> { col, row }
  const pos = useMemo(() => {
    const p: Record<string, { col: number; row: number }> = {};
    groups.forEach((g, col) => {
      g.ids.forEach((id, row) => { p[id] = { col, row } });
    });
    return p;
  }, [groups]);

  const maxRows = useMemo(() => Math.max(1, ...groups.map(g => g.ids.length)), [groups]);
  const svgW = 1000; // arbitrary virtual width for viewBox; scales to 100%
  const svgH = maxRows * itemH + Math.max(0, maxRows - 1) * vGap + 2 * colPad;

  const hpairs = new Set<string>();
  if (highlightPath.length >= 2) {
    for (let i = 0; i < highlightPath.length - 1; i++) {
      hpairs.add(`${highlightPath[i]}->${highlightPath[i + 1]}`);
    }
  }

  function nodeCenter(id: string) {
    const { col, row } = pos[id] || { col: 0, row: 0 };
    const x = ((col + 0.5) / colCount) * svgW;
    const y = colPad + row * (itemH + vGap) + itemH / 2;
    return { x, y };
  }

  return (
    <div className="relative" style={{ padding: 8 }}>
      {/* columns */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0,1fr))` }}>
        {groups.map((g) => (
          <div key={g.gid} className="space-y-2">
            <div className="text-xs font-semibold opacity-70">{g.gid}</div>
            <div className="flex flex-col gap-3">
              {g.ids.map((id) => {
                const isHL = highlightPath.includes(id);
                const meta = data.nodes[id];
                return (
                  <div
                    key={id}
                    className={`px-2 py-2 rounded border ${isHL ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                  >
                    <div className={`text-xs ${isHL ? 'font-semibold' : ''}`}>{meta?.label ?? id}</div>
                    <div className="text-[10px] opacity-60">{id}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* edges overlay */}
      <svg
        width="100%"
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="pointer-events-none absolute inset-0"
      >
        {data.edges.map((e, idx) => {
          const a = nodeCenter(e.from);
          const b = nodeCenter(e.to);
          const key = `${e.from}->${e.to}`;
          const hl = hpairs.has(key);
          return (
            <line
              key={idx}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={hl ? '#2563eb' : '#94a3b8'}
              strokeWidth={hl ? 3 : 1.5}
              strokeOpacity={0.9}
            />
          );
        })}
      </svg>
    </div>
  );
}

