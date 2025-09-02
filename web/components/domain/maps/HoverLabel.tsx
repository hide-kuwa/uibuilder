'use client';
import type { RendererProps } from '@/types/builder';

export default function HoverLabel({ values }: RendererProps) {
  return (
    <div className="rounded-md border border-border bg-panel2 px-3 py-2 text-xs shadow">
      <div className="font-medium">Hover</div>
      <div className="text-muted">県名をここに表示（後続で配線）</div>
    </div>
  );
}
