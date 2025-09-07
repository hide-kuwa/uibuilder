// packages/chizu-registry/src/components/TraceLegend.tsx
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function TraceLegend({ graph }) {
    const groups = Array.from(new Set(Object.values(graph.nodes).map(n => n.groupId ?? 'ungrouped')));
    return (_jsx("div", { className: "text-xs text-gray-600 flex flex-wrap gap-2", children: groups.map((g) => (_jsx("span", { className: "px-2 py-0.5 rounded border border-gray-300 bg-white", children: g }, g))) }));
}
