'use client';
import { useEditorStore } from '@/store/editorStore';
import { moveCrop, resizeCrop, imageToWorld, worldToImage } from '@/lib/image/crop';
import { useEffect, useRef, useState } from 'react';

export default function ImageCropOverlay() {
  const draft = useEditorStore((s) => s.cropDraft);
  const updateCrop = useEditorStore((s) => s.updateCrop);
  const commitCrop = useEditorStore((s) => s.commitCrop);
  const cancelCrop = useEditorStore((s) => s.cancelCrop);
  const assets = useEditorStore((s) => s.assets.images);
  const tree = useEditorStore((s) => s.tree);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<
    | null
    | {
        mode: 'move' | 'resize';
        handle?: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
        start: { x: number; y: number };
        rect: { x: number; y: number; w: number; h: number };
      }
  >(null);
  if (!draft) return null;
  const node = tree.find((n) => n.id === draft.nodeId) as any;
  const meta = assets[node?.props.assetId];
  const natural = { w: meta?.w || node?.props.w || 0, h: meta?.h || node?.props.h || 0 };

  const tl = imageToWorld({ x: draft.rect.x, y: draft.rect.y }, node);
  const br = imageToWorld(
    { x: draft.rect.x + draft.rect.w, y: draft.rect.y + draft.rect.h },
    node,
  );
  const rectWorld = { x: tl.x, y: tl.y, w: br.x - tl.x, h: br.y - tl.y };

  const getWorld = (e: { clientX: number; clientY: number }) => {
    const rect = overlayRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onMoveDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startImg = worldToImage(getWorld(e), node);
    setDrag({ mode: 'move', start: startImg, rect: draft.rect });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onHandleDown = (
    handle: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw',
  ) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startImg = worldToImage(getWorld(e), node);
    setDrag({ mode: 'resize', handle, start: startImg, rect: draft.rect });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  useEffect(() => {
    if (!drag) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const imgPt = worldToImage(getWorld(e), node);
        const dx = imgPt.x - drag.start.x;
        const dy = imgPt.y - drag.start.y;
        const next =
          drag.mode === 'move'
            ? moveCrop(drag.rect, dx, dy, natural)
            : resizeCrop(drag.rect, drag.handle!, dx, dy, { center: e.altKey }, natural);
        updateCrop(next);
      });
    };
    const onUp = () => setDrag(null);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      cancelAnimationFrame(raf);
    };
  }, [drag, node, natural, updateCrop]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        commitCrop();
        e.preventDefault();
      } else if (e.key === 'Escape') {
        cancelCrop();
        e.preventDefault();
      } else if (e.key.startsWith('Arrow')) {
        const dx = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
        const dy = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
        const mul = e.shiftKey ? 10 : 1;
        const next = moveCrop(draft.rect, dx * mul, dy * mul, natural);
        updateCrop(next);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [draft, commitCrop, cancelCrop, updateCrop, natural]);

  const handleSize = 8;
  const half = handleSize / 2;
  const handles: (
    | 'n'
    | 'ne'
    | 'e'
    | 'se'
    | 's'
    | 'sw'
    | 'w'
    | 'nw'
  )[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
  const handleStyle = (h: string): React.CSSProperties => {
    const { x, y, w, h: hh } = rectWorld;
    const cx = x + w / 2 - half;
    const cy = y + hh / 2 - half;
    switch (h) {
      case 'n':
        return { left: cx, top: y - half, cursor: 'ns-resize' };
      case 's':
        return { left: cx, top: y + hh - half, cursor: 'ns-resize' };
      case 'e':
        return { left: x + w - half, top: cy, cursor: 'ew-resize' };
      case 'w':
        return { left: x - half, top: cy, cursor: 'ew-resize' };
      case 'ne':
        return { left: x + w - half, top: y - half, cursor: 'nesw-resize' };
      case 'se':
        return { left: x + w - half, top: y + hh - half, cursor: 'nwse-resize' };
      case 'sw':
        return { left: x - half, top: y + hh - half, cursor: 'nesw-resize' };
      case 'nw':
        return { left: x - half, top: y - half, cursor: 'nwse-resize' };
      default:
        return {};
    }
  };

  return (
    <div ref={overlayRef} className="absolute inset-0">
      {/* darken outside */}
      <div className="pointer-events-none">
        <div
          className="absolute bg-black/50"
          style={{ left: 0, top: 0, width: '100%', height: rectWorld.y }}
        />
        <div
          className="absolute bg-black/50"
          style={{ left: 0, top: rectWorld.y, width: rectWorld.x, height: rectWorld.h }}
        />
        <div
          className="absolute bg-black/50"
          style={{
            left: rectWorld.x + rectWorld.w,
            top: rectWorld.y,
            width: `calc(100% - ${rectWorld.x + rectWorld.w}px)`,
            height: rectWorld.h,
          }}
        />
        <div
          className="absolute bg-black/50"
          style={{
            left: 0,
            top: rectWorld.y + rectWorld.h,
            width: '100%',
            height: `calc(100% - ${rectWorld.y + rectWorld.h}px)`,
          }}
        />
      </div>

      <div
        className="absolute border border-blue-400 box-border cursor-move"
        style={{
          left: rectWorld.x,
          top: rectWorld.y,
          width: rectWorld.w,
          height: rectWorld.h,
        }}
        onPointerDown={onMoveDown}
      >
        {/* grid lines */}
        <div className="absolute inset-y-0 left-1/3 w-px bg-white/60 pointer-events-none" />
        <div className="absolute inset-y-0 left-2/3 w-px bg-white/60 pointer-events-none" />
        <div className="absolute inset-x-0 top-1/3 h-px bg-white/60 pointer-events-none" />
        <div className="absolute inset-x-0 top-2/3 h-px bg-white/60 pointer-events-none" />
      </div>
      {handles.map((h) => (
        <div
          key={h}
          className="absolute bg-white border border-blue-400 box-border"
          style={{ width: handleSize, height: handleSize, ...handleStyle(h) }}
          onPointerDown={onHandleDown(h)}
        />
      ))}
    </div>
  );
}

