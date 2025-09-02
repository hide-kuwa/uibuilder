'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Opts = {
  viewBoxW: number; viewBoxH: number;
  minScale?: number; maxScale?: number; step?: number;
};

/** SVGの内側<g>に当てるための pan/zoom フック */
export function usePanZoom(refContainer: React.RefObject<HTMLElement>, opts: Opts) {
  const { viewBoxW, viewBoxH, minScale = 0.5, maxScale = 4, step = 0.1 } = opts;
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const dragging = useRef<null | { x: number; y: number; tx0: number; ty0: number }>(null);

  // ホイールでズーム（マウス位置に合わせて拡大縮小）
  const onWheel = useCallback((e: WheelEvent) => {
    // ctrlKey のズーム拡大抑止（ブラウザの拡大を避ける）
    e.preventDefault();
    const cont = refContainer.current;
    if (!cont) return;
    const rect = cont.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const k = Math.exp(-Math.sign(e.deltaY) * step); // deltaY>0で縮小
    const next = Math.min(maxScale, Math.max(minScale, scale * k));
    const zx = (mx / rect.width) * viewBoxW;
    const zy = (my / rect.height) * viewBoxH;

    // ピボット( zx, zy ) を保つように平行移動
    const txNext = zx - (zx - tx) * (next / scale);
    const tyNext = zy - (zy - ty) * (next / scale);

    setScale(next);
    setTx(txNext);
    setTy(tyNext);
  }, [refContainer, scale, step, maxScale, minScale, tx, ty, viewBoxW, viewBoxH]);

  // ドラッグでパン
  const onPointerDown = useCallback((e: PointerEvent) => {
    const cont = refContainer.current; if (!cont) return;
    cont.setPointerCapture(e.pointerId);
    dragging.current = { x: e.clientX, y: e.clientY, tx0: tx, ty0: ty };
  }, [refContainer, tx, ty]);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!dragging.current) return;
    const rect = refContainer.current!.getBoundingClientRect();
    const dxPx = e.clientX - dragging.current.x;
    const dyPx = e.clientY - dragging.current.y;
    const dx = (dxPx / rect.width) * (viewBoxW / scale);
    const dy = (dyPx / rect.height) * (viewBoxH / scale);
    setTx(dragging.current.tx0 + dx);
    setTy(dragging.current.ty0 + dy);
  }, [refContainer, scale, viewBoxW, viewBoxH]);

  const onPointerUp = useCallback((e: PointerEvent) => {
    const cont = refContainer.current; if (!cont) return;
    try { cont.releasePointerCapture(e.pointerId); } catch {}
    dragging.current = null;
  }, [refContainer]);

  // リスナー登録
  useEffect(() => {
    const el = refContainer.current;
    if (!el) return;
    const w = (e: WheelEvent) => onWheel(e);
    const d = (e: PointerEvent) => onPointerDown(e);
    const m = (e: PointerEvent) => onPointerMove(e);
    const u = (e: PointerEvent) => onPointerUp(e);
    el.addEventListener('wheel', w, { passive: false });
    el.addEventListener('pointerdown', d);
    el.addEventListener('pointermove', m);
    el.addEventListener('pointerup', u);
    el.addEventListener('pointercancel', u);
    return () => {
      el.removeEventListener('wheel', w);
      el.removeEventListener('pointerdown', d);
      el.removeEventListener('pointermove', m);
      el.removeEventListener('pointerup', u);
      el.removeEventListener('pointercancel', u);
    };
  }, [refContainer, onWheel, onPointerDown, onPointerMove, onPointerUp]);

  // 外から呼べる操作
  const zoomIn  = () => setScale((s) => Math.min(maxScale, s * (1 + step * 2)));
  const zoomOut = () => setScale((s) => Math.max(minScale, s * (1 - step * 2)));
  const reset   = () => { setScale(1); setTx(0); setTy(0); };

  const transform = useMemo(() => `translate(${tx} ${ty}) scale(${scale})`, [tx, ty, scale]);

  return { transform, zoomIn, zoomOut, reset, scale };
}
