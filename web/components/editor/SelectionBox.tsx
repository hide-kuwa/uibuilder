'use client';
import { useEditorStore } from '@/store/editorStore';

export default function SelectionBox() {
  const id = useEditorStore((s) => s.selectedIds[0]);
  const node = useEditorStore((s) => s.tree.find((n) => n.id === id));
  if (!node) return null;
  const { x = 0, y = 0, w = 0, h = 0 } = node.props || {};
  return (
    <div
      className="absolute border-2 border-blue-500 pointer-events-none"
      style={{ left: x, top: y, width: w, height: h }}
    />
  );
}
