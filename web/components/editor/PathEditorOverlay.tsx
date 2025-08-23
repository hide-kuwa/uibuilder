'use client';
import { useEditorStore } from '@/store/editorStore';
import type { PathNode, PathPoint } from '@/types/editor';
import { useRef } from 'react';

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
    if (useS) return `S${c2.x} ${c2.y} ${curr.x} ${curr.y}`;
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

export default function PathEditorOverlay() {
  const selection = useEditorStore((s) => s.vector?.selection);
  const path = useEditorStore((s) =>
    s.tree.find((n): n is PathNode => n.id === selection?.pathId && n.type === 'Path')
  );
  const selectPath = useEditorStore((s) => s.selectPath);
  const movePoint = useEditorStore((s) => s.movePoint);
  const moveHandle = useEditorStore((s) => s.moveHandle);
  const toggleCorner = useEditorStore((s) => s.toggleCorner);
  const addPointOnSegment = useEditorStore((s) => s.addPointOnSegment);
  const camera = useEditorStore((s) => s.camera);
  if (!path) return null;
  const selectedPts = selection?.pointIds || [];
  const r = 4 / camera.zoom;

  const drag = useRef<{ kind: 'point' | 'handle'; id: string; handle?: 'in' | 'out' } | null>(
    null
  );

  const onPointerDownAnchor = (e: React.PointerEvent, pt: PathPoint) => {
    selectPath(path.id, [pt.id]);
    drag.current = { kind: 'point', id: pt.id };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    e.stopPropagation();
  };

  const onPointerDownHandle = (
    e: React.PointerEvent,
    pt: PathPoint,
    kind: 'in' | 'out'
  ) => {
    drag.current = { kind: 'handle', id: pt.id, handle: kind };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    e.stopPropagation();
  };

  const toCanvas = (e: React.PointerEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / camera.zoom + camera.x,
      y: (e.clientY - rect.top) / camera.zoom + camera.y,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const pt = toCanvas(e);
    if (drag.current.kind === 'point') movePoint(drag.current.id, pt);
    else moveHandle(drag.current.id, drag.current.handle!, pt, { break: e.altKey });
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  const onDoubleClick = (e: React.MouseEvent, id: string) => {
    toggleCorner(id);
    e.stopPropagation();
  };

  const onAltClick = (e: React.PointerEvent) => {
    if (!e.altKey) return;
    const p = toCanvas(e);
    let best = { dist: Infinity, idx: 0, t: 0 };
    const pts = path.points;
    const count = path.closed ? pts.length : pts.length - 1;
    for (let i = 0; i < count; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len2 = dx * dx + dy * dy;
      let t = len2 ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2 : 0;
      t = Math.max(0, Math.min(1, t));
      const px = a.x + dx * t;
      const py = a.y + dy * t;
      const dist = Math.hypot(p.x - px, p.y - py);
      if (dist < best.dist) best = { dist, idx: i, t };
    }
    addPointOnSegment(path.id, best.idx, best.t);
    e.stopPropagation();
  };

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerDown={onAltClick}
    >
      <path
        d={pathToD(path.points, path.closed)}
        fill="none"
        stroke="transparent"
        strokeWidth={8 / camera.zoom}
        className="pointer-events-auto"
      />
      {path.points.map((pt) => (
        <g key={pt.id} className="pointer-events-none">
          {pt.in && (
            <>
              <line
                x1={pt.x}
                y1={pt.y}
                x2={pt.in.x}
                y2={pt.in.y}
                strokeWidth={1 / camera.zoom}
                className="path-handle-line pointer-events-none"
              />
              <circle
                cx={pt.in.x}
                cy={pt.in.y}
                r={r}
                strokeWidth={1 / camera.zoom}
                className="path-handle pointer-events-auto"
                onPointerDown={(e) => onPointerDownHandle(e, pt, 'in')}
              />
            </>
          )}
          {pt.out && (
            <>
              <line
                x1={pt.x}
                y1={pt.y}
                x2={pt.out.x}
                y2={pt.out.y}
                strokeWidth={1 / camera.zoom}
                className="path-handle-line pointer-events-none"
              />
              <circle
                cx={pt.out.x}
                cy={pt.out.y}
                r={r}
                strokeWidth={1 / camera.zoom}
                className="path-handle pointer-events-auto"
                onPointerDown={(e) => onPointerDownHandle(e, pt, 'out')}
              />
            </>
          )}
          <rect
            x={pt.x - r}
            y={pt.y - r}
            width={r * 2}
            height={r * 2}
            strokeWidth={1 / camera.zoom}
            transform={`rotate(45 ${pt.x} ${pt.y})`}
            className={`path-anchor${selectedPts.includes(pt.id) ? ' selected' : ''} pointer-events-auto`}
            onPointerDown={(e) => onPointerDownAnchor(e, pt)}
            onDoubleClick={(e) => onDoubleClick(e, pt.id)}
          />
        </g>
      ))}
    </svg>
  );
}
