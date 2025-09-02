'use client';
import type { RendererProps } from '@/types/builder';
import { useMapUIStore } from './mapStore';
import { PREF_LABELS } from './data/labels';

export default function HoverLabel({ values }: RendererProps) {
  const code = useMapUIStore(s => s.hoverPref);
  if (!code) {
    return (
      <div className="rounded-md border border-border bg-panel2 px-3 py-2 text-xs shadow">
        <div className="text-muted">カーソルを地図に合わせると県名が表示されます</div>
      </div>
    );
  }
  const name = PREF_LABELS[code]?.name ?? code;
  return (
    <div className="rounded-md border border-border bg-panel2 px-3 py-2 text-xs shadow">
      <div className="font-medium">{name}</div>
      <div className="text-muted text-[11px]">Code: {code}</div>
    </div>
  );
}
