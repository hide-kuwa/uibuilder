'use client';
import { useEditorStore } from '@/store/editorStore';

export default function LeftPanel() {
  const tree = useEditorStore((s) => s.tree);
  return (
    <div className="bg-gray-800 p-2 overflow-y-auto">
      <h2 className="text-sm mb-2">Layers</h2>
      <ul className="space-y-1">
        {tree.map((n) => (
          <li key={n.id} className="text-xs">
            {n.name || n.type}
          </li>
        ))}
      </ul>
    </div>
  );
}
