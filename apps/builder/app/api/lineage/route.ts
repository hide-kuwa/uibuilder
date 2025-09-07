// apps/builder/app/api/lineage/route.ts
import { NextResponse } from 'next/server';
import type { LineageGraph } from '@chizu/types/lineage';

const mock: LineageGraph = {
  nodes: {
    'tb:交際費': { id: 'tb:交際費', label: 'TB 交際費', kind: 'TB', groupId: 'g1' },
    'sheet:交際費集計': { id: 'sheet:交際費集計', label: 'GridSheet 交際費', kind: 'Schedule', groupId: 'g1' },
    'calc:否認額': { id: 'calc:否認額', label: '否認額計算', kind: 'Calc', groupId: 'g1' },
    'tax:別表加算': { id: 'tax:別表加算', label: '別表加算', kind: 'Schedule', groupId: 'g1' },
  },
  edges: [
    { from: 'tb:交際費', to: 'sheet:交際費集計' },
    { from: 'sheet:交際費集計', to: 'calc:否認額', flags: { rounded: false } },
    { from: 'calc:否認額', to: 'tax:別表加算', flags: { taxAdjust: true } },
  ],
};

export async function GET() {
  return NextResponse.json(mock, { status: 200 });
}

