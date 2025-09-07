// packages/chizu-registry/src/components/TraceLegend.tsx
'use client';
import React from 'react';
import type { LineageGraph } from '@chizu/types/lineage';

export function TraceLegend({ graph }: { graph: LineageGraph }) {
  const groups = Array.from(new Set(Object.values(graph.nodes).map(n => n.groupId ?? 'ungrouped')));
  return (
    <div className="text-xs text-gray-600 flex flex-wrap gap-2">
      {groups.map((g) => (
        <span key={g} className="px-2 py-0.5 rounded border border-gray-300 bg-white">{g}</span>
      ))}
    </div>
  );
}

