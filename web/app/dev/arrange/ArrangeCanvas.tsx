'use client';

import { useBuilderStore } from '@/stores/builder';
import { useEffect, useState } from 'react';

export default function ArrangeCanvas({
  onSave,
}: {
  onSave: (nodes: { id: string; x: number; y: number; w: number; h: number }[]) => void;
}) {
  type Node = { id: string; name?: string; x: number; y: number; w: number; h: number };

  const nodes = useBuilderStore((s) => s.nodes);
  const [localNodes, setLocalNodes] = useState<Node[]>([]);

  useEffect(() => {
    setLocalNodes(
      nodes.map((n) => ({
        id: n.id,
        name: n.name,
        x: n.x ?? 0,
        y: n.y ?? 0,
        w: n.w ?? 120,
        h: n.h ?? 80,
      }))
    );
  }, [nodes]);

  type DragState =
    | { id: string; type: 'move'; offsetX: number; offsetY: number }
    | {
        id: string;
        type: 'resize';
        startX: number;
        startY: number;
        startW: number;
        startH: number;
      };
  const [drag, setDrag] = useState<DragState | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setLocalNodes((prev) => {
        if (!drag) return prev;
        return prev.map((n) => {
          if (n.id !== drag.id) return n;
          if (drag.type === 'move') {
            return { ...n, x: e.clientX - drag.offsetX, y: e.clientY - drag.offsetY };
          }
          return {
            ...n,
            w: Math.max(20, drag.startW + (e.clientX - drag.startX)),
            h: Math.max(20, drag.startH + (e.clientY - drag.startY)),
          };
        });
      });
    };
    const onUp = () => setDrag(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [drag]);

  const startDrag = (id: string, e: React.MouseEvent) => {
    const node = localNodes.find((n) => n.id === id);
    if (!node) return;
    e.preventDefault();
    setDrag({ id, type: 'move', offsetX: e.clientX - node.x, offsetY: e.clientY - node.y });
  };

  const startResize = (id: string, e: React.MouseEvent) => {
    const node = localNodes.find((n) => n.id === id);
    if (!node) return;
    e.preventDefault();
    e.stopPropagation();
    setDrag({ id, type: 'resize', startX: e.clientX, startY: e.clientY, startW: node.w, startH: node.h });
  };

  const handleSave = () => {
    onSave(localNodes.map(({ id, x, y, w, h }) => ({ id, x, y, w, h })));
  };

  return (
    <div className="relative w-full h-[600px] border bg-zinc-50">
      {localNodes.map((n) => (
        <div
          key={n.id}
          onMouseDown={(e) => startDrag(n.id, e)}
          className="absolute border bg-white shadow-sm cursor-move select-none"
          style={{ left: n.x, top: n.y, width: n.w, height: n.h }}
        >
          <div className="w-full h-full flex items-center justify-center text-xs text-zinc-800">
            {n.name || n.id}
          </div>
          <div
            onMouseDown={(e) => startResize(n.id, e)}
            className="absolute w-3 h-3 bg-blue-500 bottom-0 right-0 cursor-se-resize"
          />
        </div>
      ))}
      <button
        onClick={handleSave}
        className="absolute top-2 left-2 px-3 py-1 text-sm rounded bg-black text-white dark:bg-white dark:text-black"
      >
        保存
      </button>
    </div>
  );
}

