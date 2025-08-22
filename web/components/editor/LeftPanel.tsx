'use client';
import { useEditorStore } from '@/store/editorStore';

export default function LeftPanel() {
  const tree = useEditorStore((s) => s.tree);
  const reorder = useEditorStore((s) => s.reorderChild);

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, idx: number) => {
    e.dataTransfer.setData('text/plain', String(idx));
  };
  const handleDrop = (e: React.DragEvent<HTMLLIElement>, idx: number) => {
    const from = Number(e.dataTransfer.getData('text/plain'));
    reorder('', from, idx);
  };

  return (
    <div className="bg-gray-800 p-2 overflow-y-auto">
      <h2 className="text-sm mb-2">Layers</h2>
      <ul className="space-y-1">
        {tree.map((n, i) => (
          <li
            key={n.id}
            className="text-xs"
            draggable
            onDragStart={(e) => handleDragStart(e, i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, i)}
          >
            {n.name || n.type}
          </li>
        ))}
      </ul>
    </div>
  );
}
