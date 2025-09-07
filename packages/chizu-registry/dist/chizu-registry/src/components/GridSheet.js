// packages/chizu-registry/src/components/GridSheet.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
function cast(v, type) {
    if (v == null)
        return v;
    if (type === 'number')
        return typeof v === 'number' ? v : Number(v);
    if (type === 'date')
        return v instanceof Date ? v : new Date(v);
    return String(v);
}
export function GridSheet({ schema, rows: initRows }) {
    const [rows, setRows] = React.useState(initRows ?? []);
    const addRow = () => setRows((r) => [...r, Object.fromEntries(schema.columns.map(c => [c.key, null]))]);
    const delRow = (i) => setRows((r) => r.filter((_, idx) => idx !== i));
    const setCell = (i, key, value) => setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)));
    const errors = React.useMemo(() => {
        return rows.map((row) => {
            const er = {};
            for (const col of schema.columns) {
                const v = row[col.key];
                if (col.required && (v === null || v === undefined || v === ''))
                    er[col.key] = '必須';
                if (col.type === 'number' && v != null && Number.isNaN(Number(v)))
                    er[col.key] = '数値を入力';
                // validate式は後続対応
            }
            return er;
        });
    }, [rows, schema.columns]);
    const footerSum = {};
    (schema.footer?.sum ?? []).forEach((key) => {
        footerSum[key] = rows.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
    });
    return (_jsxs("div", { className: "text-sm", children: [_jsxs("table", { className: "min-w-full border border-gray-200", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-50", children: [schema.columns.map((c) => (_jsx("th", { className: "px-2 py-1 text-left border-b", children: c.label }, c.key))), _jsx("th", { className: "px-2 py-1 text-left border-b w-20", children: "\u64CD\u4F5C" })] }) }), _jsx("tbody", { children: rows.map((row, i) => (_jsxs("tr", { children: [schema.columns.map((c) => {
                                    const err = errors[i]?.[c.key];
                                    return (_jsxs("td", { className: "px-2 py-1 border-b align-top", children: [_jsx("input", { className: `w-full border rounded px-1 py-0.5 ${err ? 'border-red-400' : 'border-gray-200'}`, value: row[c.key] ?? '', type: c.type === 'number' ? 'number' : c.type === 'date' ? 'date' : 'text', onChange: (e) => setCell(i, c.key, cast(e.target.value, c.type)) }), err ? _jsx("div", { className: "text-xs text-red-500 mt-0.5", children: err }) : null] }, c.key));
                                }), _jsx("td", { className: "px-2 py-1 border-b", children: _jsx("button", { className: "underline", onClick: () => delRow(i), type: "button", children: "\u524A\u9664" }) })] }, i))) }), schema.footer?.sum?.length ? (_jsx("tfoot", { children: _jsxs("tr", { className: "bg-gray-50", children: [schema.columns.map((c) => (_jsx("td", { className: "px-2 py-1 border-t font-medium", children: schema.footer?.sum?.includes(c.key) ? footerSum[c.key] : '' }, c.key))), _jsx("td", { className: "px-2 py-1 border-t" })] }) })) : null] }), _jsx("div", { className: "mt-2", children: _jsx("button", { className: "underline", onClick: addRow, type: "button", children: "\u884C\u3092\u8FFD\u52A0" }) })] }));
}
