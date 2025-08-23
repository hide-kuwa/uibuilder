'use client';
import { useEditorStore } from '@/store/editorStore';
import { useState, useRef } from 'react';
import type { PathPoint } from '@/types/editor';
import { angleSnap } from '@/lib/vector/bezier';

function areMirrored(pt: PathPoint) {
  return (
    pt.in &&
    pt.out &&
    Math.abs(pt.x * 2 - pt.in.x - pt.out.x) < 1e-6 &&
    Math.abs(pt.y * 2 - pt.in.y - pt.out.y) < 1e-6
  );
}

function segToCmd(prev: PathPoint, curr: PathPoint, prevSmooth: boolean) {
  const c1 = prev.out || prev;
  const c2 = curr.in || curr;
  const useS = prevSmooth;
  if (prev.out || curr.in) {
    if (useS) {
      return `S${c2.x} ${c2.y} ${curr.x} ${curr.y}`;
    }
    return `C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${curr.x} ${curr.y}`;
  }
  return `L${curr.x} ${curr.y}`;
}

function pathToD(pts: PathPoint[], closed?: boolean) {
  if (!pts.length) return '';
  const cmds = [`M${pts[0].x} ${pts[0].y}`];
  for (let i = 1; i < pts.length; i++) {
    cmds.push(segToCmd(pts[i - 1], pts[i], areMirrored(pts[i - 1])));
  }
  if (closed) {
    const last = pts[pts.length - 1];
    const first = pts[0];
    cmds.push(segToCmd(last, first, areMirrored(last)));
    cmds.push('Z');
  }
  return cmds.join(' ');
}

export default function PenTool() {
  const draft = useEditorStore((s) => s.vector?.draft);
  const placePoint = useEditorStore((s) => s.placePoint);
  const moveHandle = useEditorStore((s) => s.moveHandle);
  const closePath = useEditorStore((s) => s.closePath);
  const camera = useEditorStore((s) => s.camera);

  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const pending = useRef<{ x: number; y: number } | null>(null);
  const raf = useRef<number>();
  const dragId = useRef<string | null>(null);

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
    placePoint({ x: pt.x, y: pt.y });
    const d = useEditorStore.getState().vector!.draft!;
    dragId.current = d.points[d.points.length - 1].id;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    e.stopPropagation();
    const pt = toCanvas(e);
    pending.current = pt;
    if (dragId.current) {
      const d = useEditorStore.getState().vector?.draft;
      const p = d?.points.find((q) => q.id === dragId.current);
      if (p) {
        let h = pt;
        if (e.shiftKey) {
          const snap = angleSnap(pt.x - p.x, pt.y - p.y);
          h = { x: p.x + snap.x, y: p.y + snap.y };
        }
        moveHandle(p.id, 'out', h, { break: e.altKey });
      }
    } else {
      if (!raf.current) {
        raf.current = requestAnimationFrame(updateCursor);
      }
    }
  };

  const onPointerUp = () => {
    dragId.current = null;
  };

  const previewD =
    draft && cursor && draft.points.length && !dragId.current
      ? pathToD([...draft.points, { id: 'p', x: cursor.x, y: cursor.y }])
      : pathToD(draft?.points || [], draft?.closed);

  return (
    <div
      className="absolute inset-0 cursor-crosshair"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {draft && (
        <svg className="absolute inset-0 pointer-events-none">
          <path
            d={pathToD(draft.points, draft.closed)}
            fill="none"
            stroke="#ffffff"
            strokeWidth={1}
            opacity={0.5}
          />
          {previewD && previewD !== pathToD(draft.points, draft.closed) && (
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
