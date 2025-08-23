'use client';
import { useEditorStore } from '@/store/editorStore';
import type { PathNode } from '@/types/editor';

export default function PathEditorOverlay() {
  const selection = useEditorStore((s) => s.vector?.selection);
  const path = useEditorStore((s) =>
    s.tree.find((n): n is PathNode => n.id === selection?.pathId && n.type === 'Path')
  );
  const selectPath = useEditorStore((s) => s.selectPath);
  if (!path) return null;
  const selectedPts = selection?.pointIds || [];
  return (
    <svg className="absolute inset-0 pointer-events-none">
      {path.points.map((pt) => (
        <circle
          key={pt.id}
          cx={pt.x}
          cy={pt.y}
          r={4}
          fill={selectedPts.includes(pt.id) ? '#ffa500' : '#ffffff'}
          stroke="#000000"
          strokeWidth={1}
          className="pointer-events-auto"
          onPointerDown={(e) => {
            selectPath(path.id, [pt.id]);
            e.stopPropagation();
          }}
        />
      ))}
    </svg>
  );
}
