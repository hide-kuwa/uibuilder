// packages/chizu-registry/src/components/GridSheetV2.tsx
'use client';
import React from 'react';
import type { GridSchema } from '@chizu/types/gridsheet';

type Row = Record<string, any>;
type Props = { schema: GridSchema; rows?: Row[]; dataKey?: string };

function toDateString(v: any) {
  if (!v) return '';
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function GridSheetV2({ schema, rows: initRows }: Props) {
  const [rows, setRows] = React.useState<Row[]>(
    (initRows ?? []).map((r) => {
      const nr: Row = { ...r };
      for (const c of schema.columns) {
        if (c.type === 'date' && nr[c.key] != null) nr[c.key] = toDateString(nr[c.key]);
      }
      return nr;
    })
  );
  const addRow = () => setRows((r) => [...r, Object.fromEntries(schema.columns.map(c => [c.key, '']))]);
  const delRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));
  const setCell = (i: number, key: string, value: any) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)));

  const errors = React.useMemo(() => rows.map((row) => {
    const er: Record<string, string|undefined> = {};
    for (const col of schema.columns) {
      const v = row[col.key];
      if (col.required && (v === null || v === undefined || v === '')) er[col.key] = '必須';
      if (col.type === 'number' && v !== '' && Number.isNaN(Number(v))) er[col.key] = '数値を入力';
    }
    return er;
  }), [rows, schema.columns]);

  const footerSum: Record<string, number> = {};
  (schema.footer?.sum ?? []).forEach((key) => {
    footerSum[key] = rows.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
  });

  return (
    <div className="text-sm">
      <table className="min-w-full border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            {schema.columns.map((c) => (
              <th key={c.key} className="px-2 py-1 text-left border-b">{c.label}</th>
            ))}
            <th className="px-2 py-1 text-left border-b w-20">操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {schema.columns.map((c) => {
                const err = errors[i]?.[c.key];
                const value =
                  c.type === 'date' ? toDateString(row[c.key]) :
                  c.type === 'number' ? (row[c.key] ?? '') :
                  (row[c.key] ?? '');
                const inputType = c.type === 'number' ? 'number' : c.type === 'date' ? 'date' : 'text';
                return (
                  <td key={c.key} className="px-2 py-1 border-b align-top">
                    <input
                      className={`w-full border rounded px-1 py-0.5 ${err ? 'border-red-400' : 'border-gray-200'}`}
                      value={value}
                      type={inputType}
                      onChange={(e) => setCell(i, c.key, inputType === 'number' ? e.target.value : e.target.value)}
                    />
                    {err ? <div className="text-xs text-red-500 mt-0.5">{err}</div> : null}
                  </td>
                );
              })}
              <td className="px-2 py-1 border-b">
                <button className="underline" onClick={() => delRow(i)} type="button">削除</button>
              </td>
            </tr>
          ))}
        </tbody>
        {schema.footer?.sum?.length ? (
          <tfoot>
            <tr className="bg-gray-50">
              {schema.columns.map((c) => (
                <td key={c.key} className="px-2 py-1 border-t font-medium">
                  {schema.footer?.sum?.includes(c.key) ? footerSum[c.key] : ''}
                </td>
              ))}
              <td className="px-2 py-1 border-t"></td>
            </tr>
          </tfoot>
        ) : null}
      </table>
      <div className="mt-2">
        <button className="underline" onClick={addRow} type="button">行を追加</button>
      </div>
    </div>
  );
}

