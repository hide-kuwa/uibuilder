'use client';
import { useEditorStore } from '@/store/editorStore';

export default function SelectionOutline() {
  const id = useEditorStore((s) => s.selectedIds[0]);
  const node = useEditorStore((s) => s.tree.find((n) => n.id === id));
  if (!node) return null;
  const { x = 0, y = 0, w = 0, h = 0 } = node.props || {};
  return (
    <div
      className="absolute pointer-events-none rounded-sm"
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        boxShadow:
          'inset 0 0 0 1px rgba(59,130,246,0.8), 0 0 0 1px rgba(59,130,246,0.4)',
        transition: 'all var(--motion-fast) var(--easing-standard)',
      }}
    />
  );
}
