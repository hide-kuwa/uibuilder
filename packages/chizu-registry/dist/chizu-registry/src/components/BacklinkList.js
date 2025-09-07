// packages/chizu-registry/src/components/BacklinkList.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useLineage } from '@chizu/ui/hooks/useLineage';
function bfsUp(graph, start) {
    const up = [];
    const seen = new Set([start]);
    let q = [start];
    while (q.length) {
        const cur = q.shift();
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
function bfsDown(graph, start) {
    const down = [];
    const seen = new Set([start]);
    let q = [start];
    while (q.length) {
        const cur = q.shift();
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
export function BacklinkList({ title = 'Backlinks', selectedId, onSelect }) {
    const { data } = useLineage();
    const up = useMemo(() => (data && selectedId ? bfsUp(data, selectedId) : []), [data, selectedId]);
    const down = useMemo(() => (data && selectedId ? bfsDown(data, selectedId) : []), [data, selectedId]);
    if (!data)
        return _jsx("div", { className: "text-sm text-gray-500", children: "Loading lineage\u2026" });
    if (!selectedId)
        return _jsx("div", { className: "text-sm text-gray-500", children: "\u30CE\u30FC\u30C9\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044" });
    const nodeLabel = (id) => data.nodes[id]?.label ?? id;
    return (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "font-medium", children: title }), _jsxs("section", { children: [_jsxs("div", { className: "text-xs font-semibold opacity-70 mb-1", children: ["\u4E0A\u6D41\uFF08", up.length, "\uFF09"] }), _jsx("ul", { className: "space-y-1", children: up.map((id) => (_jsx("li", { children: _jsx("button", { className: "text-sm underline underline-offset-2 hover:opacity-80", onClick: () => onSelect?.(id), type: "button", children: nodeLabel(id) }) }, `up-${id}`))) })] }), _jsxs("section", { children: [_jsxs("div", { className: "text-xs font-semibold opacity-70 mb-1", children: ["\u4E0B\u6D41\uFF08", down.length, "\uFF09"] }), _jsx("ul", { className: "space-y-1", children: down.map((id) => (_jsx("li", { children: _jsx("button", { className: "text-sm underline underline-offset-2 hover:opacity-80", onClick: () => onSelect?.(id), type: "button", children: nodeLabel(id) }) }, `down-${id}`))) })] })] }));
}
