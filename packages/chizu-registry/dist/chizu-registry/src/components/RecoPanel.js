// packages/chizu-registry/src/components/RecoPanel.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export function RecoPanel({ left, right, matches, onConfirm, }) {
    const [confirmed, setConfirmed] = React.useState(new Set());
    const confirm = (m) => {
        const key = `${m.leftId}-${m.rightId}`;
        setConfirmed(s => new Set(s).add(key));
        onConfirm?.(m);
    };
    return (_jsxs("div", { className: "text-sm space-y-2", children: [_jsx("div", { className: "font-semibold", children: "\u7167\u5408\u5019\u88DC" }), _jsx("ul", { className: "space-y-1", children: matches.map(m => {
                    const key = `${m.leftId}-${m.rightId}`;
                    const done = confirmed.has(key);
                    return (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx("span", { className: "px-2 py-0.5 rounded bg-gray-100", children: m.score.toFixed(2) }), _jsxs("span", { children: [m.leftId, " \u2194 ", m.rightId] }), done ? (_jsx("span", { className: "text-green-600", children: "\u78BA\u5B9A\u6E08" })) : (_jsx("button", { className: "underline", onClick: () => confirm(m), type: "button", children: "\u78BA\u5B9A" }))] }, key));
                }) })] }));
}
