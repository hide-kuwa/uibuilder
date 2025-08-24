'use client';
import { useRef, useState, useEffect } from 'react';
import * as zoom from '@/lib/zoom';
import { useEditorStore } from '@/store/editorStore';

interface Props {
  start: { x: number; y: number };
  onEnd: () => void;
}

export default function MarqueeZoom({ start, onEnd }: Props) {
  const [rect, setRect] = useState({ x: start.x, y: start.y, w: 0, h: 0 });
  const rectRef = useRef(rect);
  useEffect(() => {
    rectRef.current = rect;
  }, [rect]);

  useEffect(() => {
    function onMove(e: PointerEvent) {
      setRect({
        x: Math.min(start.x, e.clientX),
        y: Math.min(start.y, e.clientY),
        w: Math.abs(e.clientX - start.x),
        h: Math.abs(e.clientY - start.y),
      });
    }
    function finish(confirm: boolean) {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('keydown', onKey);
      if (confirm) {
        const r = rectRef.current;
        const center = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
        const cam = useEditorStore.getState().camera;
        if (r.w < 16 || r.h < 16) {
          zoom.zoomBy(1.5, center);
        } else {
          const target = zoom.fitRect(cam, r);
          zoom.animateZoomTo(target, { duration: 240 });
        }
      }
      onEnd();
    }
    function onUp() {
      finish(true);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') finish(false);
      if (e.key === 'Enter') finish(true);
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('keydown', onKey);
    };
  }, [start, onEnd]);

  return (
    <div
      className="marquee-zoom"
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
      }}
    />
  );
}
