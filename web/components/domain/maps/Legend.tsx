'use client';
import type { RendererProps } from '@/types/builder';

export default function Legend({ values }: RendererProps) {
  const items = [
    { key: 'visited', label: 'Visited',  color: values.colorVisited ?? '#22c55e' },
    { key: 'lived',   label: 'Lived',    color: values.colorLived   ?? '#0ea5e9' },
    { key: 'passed',  label: 'Passed',   color: values.colorPassed  ?? '#f59e0b' },
    { key: 'none',    label: 'Default',  color: values.colorDefault ?? '#1f2937' },
  ];
  return (
    <div className="rounded-md border border-border bg-panel2 px-3 py-2 text-xs shadow">
      <div className="font-medium mb-1">Legend</div>
      <div className="grid gap-1">
        {items.map(i => (
          <div key={i.key} className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded" style={{ background: i.color }} />
            <span>{i.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
