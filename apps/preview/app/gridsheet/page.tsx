// apps/preview/app/gridsheet/page.tsx
'use client';
import React from 'react';
import { GridSheet } from '@chizu/registry';
import type { GridSchema } from '@chizu/types/gridsheet';

const schema: GridSchema = {
  columns: [
    { key: 'date', label: '日付', type: 'date', required: true },
    { key: 'partner', label: '相手先', type: 'text', required: true },
    { key: 'purpose', label: '目的', type: 'text' },
    { key: 'amount', label: '金額', type: 'number', required: true },
  ],
  footer: { sum: ['amount'] },
};

const sample = [
  { date: '2025-08-01', partner: '〇〇商事', purpose: '接待', amount: 12000 },
  { date: '2025-08-21', partner: '△△物産', purpose: '会食', amount: 8000 },
];

export default function GridSheetPreviewPage() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-lg font-semibold">GridSheet Preview（交際費サンプル）</h1>
      <GridSheet schema={schema} rows={sample} />
    </main>
  );
}

