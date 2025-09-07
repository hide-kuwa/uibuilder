// packages/chizu-registry/src/components/NodeInspectorV2.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useLineage } from '@chizu/ui/hooks/useLineage';
export function NodeInspectorV2({ selectedId, showRounding = true }) {
    const { data } = useLineage();
    if (!data)
        return _jsx("div", { className: "text-sm text-gray-500", children: "Loading\u2026" });
    if (!selectedId)
        return _jsx("div", { className: "text-sm text-gray-500", children: "\u30CE\u30FC\u30C9\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044" });
    const meta = data.nodes[selectedId];
    if (!meta)
        return _jsxs("div", { className: "text-sm text-red-500", children: ["\u672A\u767B\u9332\u30CE\u30FC\u30C9: ", selectedId] });
    const connected = useMemo(() => data.edges.filter((edge) => edge.from === selectedId || edge.to === selectedId), [data, selectedId]);
    const flagsAgg = connected.reduce((acc, edge) => ({
        rounded: acc.rounded || !!edge.flags?.rounded,
        taxAdjust: acc.taxAdjust || !!edge.flags?.taxAdjust,
        manualAdjust: acc.manualAdjust || !!edge.flags?.manualAdjust,
    }), { rounded: false, taxAdjust: false, manualAdjust: false });
    return (_jsxs("div", { className: "space-y-2 text-sm", children: [_jsx("div", { className: "font-semibold", children: "Node Inspector V2" }), _jsxs("div", { children: [_jsx("span", { className: "opacity-60", children: "ID\uFF1A" }), meta.id] }), _jsxs("div", { children: [_jsx("span", { className: "opacity-60", children: "Label\uFF1A" }), meta.label ?? '-'] }), _jsxs("div", { children: [_jsx("span", { className: "opacity-60", children: "Kind\uFF1A" }), meta.kind] }), meta.tags?.length ? _jsxs("div", { children: [_jsx("span", { className: "opacity-60", children: "Tags\uFF1A" }), meta.tags.join(', ')] }) : null, showRounding && (_jsxs("div", { className: "pt-2", children: [_jsx("div", { className: "opacity-60 text-xs", children: "Flags" }), _jsxs("ul", { className: "list-disc list-inside", children: [_jsxs("li", { children: ["rounded: ", String(flagsAgg.rounded)] }), _jsxs("li", { children: ["taxAdjust: ", String(flagsAgg.taxAdjust)] }), _jsxs("li", { children: ["manualAdjust: ", String(flagsAgg.manualAdjust)] })] })] }))] }));
}
