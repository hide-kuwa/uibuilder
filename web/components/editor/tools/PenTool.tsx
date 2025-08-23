'use client';
import { useEditorStore } from '@/store/editorStore';
import { useState, useRef } from 'react';
import type { PathPoint } from '@/types/editor';

function pathToD(pts: PathPoint[]) {
  if (!pts.length) return '';
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
}

export default function PenTool() {
  const draft = useEditorStore((s) => s.vector?.draft);
  const placePoint = useEditorStore((s) => s.placePoint);
  const closePath = useEditorStore((s) => s.closePath);
  const camera = useEditorStore((s) => s.camera);

  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const pending = useRef<{ x: number; y: number } | null>(null);
  const raf = useRef<number>();

  const updateCursor = () => {
    raf.current = undefined;
    if (pending.current) setCursor(pending.current);
  };

  const toCanvas = (e: React.PointerEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / camera.zoom + camera.x,
      y: (e.clientY - rect.top) / camera.zoom + camera.y,
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const pt = toCanvas(e);
    if (draft && draft.points.length) {
      const first = draft.points[0];
      const dx = pt.x - first.x;
      const dy = pt.y - first.y;
      if (Math.hypot(dx, dy) * camera.zoom <= 6) {
        placePoint({ x: first.x, y: first.y });
        closePath();
        return;
      }
    }
    placePoint(pt);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    e.stopPropagation();
    const pt = toCanvas(e);
    pending.current = pt;
    if (!raf.current) {
      raf.current = requestAnimationFrame(updateCursor);
    }
  };

  const previewD =
    draft && cursor && draft.points.length
      ? `M${draft.points[draft.points.length - 1].x} ${draft.points[draft.points.length - 1].y} L${cursor.x} ${cursor.y}`
      : '';

  return (
    <div
      className="absolute inset-0 cursor-crosshair"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
    >
      {draft && (
        <svg className="absolute inset-0 pointer-events-none">
          <path
            d={pathToD(draft.points)}
            fill="none"
            stroke="#ffffff"
            strokeWidth={1}
            opacity={0.5}
          />
          {previewD && (
            <path
              d={previewD}
              fill="none"
              stroke="#ffffff"
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.5}
            />
          )}
        </svg>
      )}
    </div>
  );
}
