// packages/chizu-registry/src/components/PublishSummary.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export function PublishSummary({ flags, onLockToggle, }) {
    const [state, setState] = React.useState('Draft');
    return (_jsxs("div", { className: "space-y-2 text-sm", children: [_jsx("div", { className: "font-semibold", children: "Publish Summary" }), _jsxs("ul", { className: "list-disc list-inside", children: [_jsxs("li", { children: ["rounded: ", String(!!flags.rounded)] }), _jsxs("li", { children: ["taxAdjust: ", String(!!flags.taxAdjust)] }), _jsxs("li", { children: ["manualAdjust: ", String(!!flags.manualAdjust)] })] }), _jsx("div", { className: "pt-2", children: _jsxs("button", { className: "underline", onClick: () => {
                        const next = state === 'Draft' ? 'Published' : 'Draft';
                        setState(next);
                        onLockToggle?.(next);
                    }, children: ["\u5207\u66FF: ", state, " \u2192 ", state === 'Draft' ? 'Published' : 'Draft'] }) })] }));
}
