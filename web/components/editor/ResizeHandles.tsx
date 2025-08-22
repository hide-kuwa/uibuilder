'use client';
import { useEditorStore } from '@/store/editorStore';

export default function ResizeHandles() {
  const id = useEditorStore((s) => s.selectedIds[0]);
  const node = useEditorStore((s) => s.tree.find((n) => n.id === id));
  if (!node) return null;
  const { x = 0, y = 0, w = 0, h = 0 } = node.props || {};
  const size = 6;
  const handles = [
    { key: 'tl', left: x - size, top: y - size },
    { key: 'tr', left: x + w, top: y - size },
    { key: 'bl', left: x - size, top: y + h },
    { key: 'br', left: x + w, top: y + h },
  ];
  return (
    <>
      {handles.map((h) => (
        <div
          key={h.key}
          className="absolute bg-blue-500"
          style={{ width: size, height: size, left: h.left, top: h.top }}
        />
      ))}
    </>
  );
}
