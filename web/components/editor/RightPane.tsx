'use client';
import { useEditorStore } from '@/store/editorStore';
import type { PathNode } from '@/types/editor';

export default function RightPane() {
  const selected = useEditorStore((s) => s.vector?.selection?.pathId);
  const path = useEditorStore((s) =>
    s.tree.find((n): n is PathNode => n.id === selected && n.type === 'Path')
  );
  const update = useEditorStore((s) => s.updatePathProps);
  if (!path) return <div className="bg-gray-800" />;
  const props = path.props || {};
  return (
    <div className="bg-gray-800 p-2 space-y-2 text-xs">
      <label className="block">
        Fill:
        <input
          type="text"
          className="w-full bg-gray-700 ml-1 p-1 text-white"
          value={props.fill || ''}
          onChange={(e) => update(path.id, { fill: e.target.value })}
        />
      </label>
      <label className="block">
        Stroke:
        <input
          type="text"
          className="w-full bg-gray-700 ml-1 p-1 text-white"
          value={props.stroke || ''}
          onChange={(e) => update(path.id, { stroke: e.target.value })}
        />
      </label>
      <label className="block">
        Width:
        <input
          type="number"
          className="w-full bg-gray-700 ml-1 p-1 text-white"
          value={props.strokeWidth ?? 1}
          onChange={(e) =>
            update(path.id, { strokeWidth: Number(e.target.value) })
          }
        />
      </label>
    </div>
  );
}
