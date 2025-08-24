'use client';
import { useEditorStore } from '@/store/editorStore';
import type { ComponentNode } from '@/types/editor';
import { useEffect, useRef, useMemo, useCallback } from 'react';

type Rect = { x: number; y: number; w: number; h: number };

function collect(nodes: ComponentNode[], ox = 0, oy = 0, acc: Rect[] = []): Rect[] {
  for (const n of nodes) {
    const x = ox + (n.props?.x || 0);
    const y = oy + (n.props?.y || 0);
    const w = n.props?.w || 0;
    const h = n.props?.h || 0;
    acc.push({ x, y, w, h });
    if (n.children) collect(n.children as ComponentNode[], x, y, acc);
  }
  return acc;
}

export default function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tree = useEditorStore((s) => s.tree);
  const camera = useEditorStore((s) => s.camera);
  const centerOn = useEditorStore((s) => s.centerOn);

  const rects = useMemo(() => collect(tree), [tree]);
  const transform = useRef({ scale: 1, ox: 0, oy: 0, x1: 0, y1: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, W, H);
    if (!rects.length) return;

    const x1 = Math.min(...rects.map((r) => r.x));
    const y1 = Math.min(...rects.map((r) => r.y));
    const x2 = Math.max(...rects.map((r) => r.x + r.w));
    const y2 = Math.max(...rects.map((r) => r.y + r.h));
    const w = x2 - x1;
    const h = y2 - y1;
    const scale = Math.min(W / w, H / h) || 1;
    const ox = (W - w * scale) / 2 - x1 * scale;
    const oy = (H - h * scale) / 2 - y1 * scale;
    transform.current = { scale, ox, oy, x1, y1 };

    ctx.strokeStyle = '#555';
    rects.forEach((r) => {
      ctx.strokeRect(r.x * scale + ox, r.y * scale + oy, r.w * scale, r.h * scale);
    });

    const vw = window.innerWidth / camera.zoom;
    const vh = window.innerHeight / camera.zoom;
    ctx.strokeStyle = '#0ff';
    ctx.strokeRect(
      camera.x * scale + ox,
      camera.y * scale + oy,
      vw * scale,
      vh * scale,
    );
  }, [rects, camera]);

  const moveTo = useCallback(
    (e: React.PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const { scale, ox, oy, x1, y1 } = transform.current;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const wx = (px - ox) / scale + x1;
      const wy = (py - oy) / scale + y1;
      centerOn({ x: wx, y: wy });
    },
    [centerOn],
  );

  const dragging = useRef(false);
  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    moveTo(e);
  };
  const onMove = (e: React.PointerEvent) => {
    if (dragging.current) moveTo(e);
  };
  const onUp = () => {
    dragging.current = false;
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
    />
  );
}

