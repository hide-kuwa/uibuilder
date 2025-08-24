'use client';
import { useEditorStore } from '@/store/editorStore';

export default function ComponentsPanel() {
  const components = useEditorStore((s) => Object.values(s.components));
  const placeInstance = useEditorStore((s) => s.placeInstance);

  return (
    <div className="p-2 space-y-1 text-xs">
      {components.map((c) => (
        <div
          key={c.id}
          className="cursor-pointer hover:bg-gray-700 px-1 py-0.5 rounded"
          onClick={() => placeInstance(c.id)}
        >
          {c.name}
        </div>
      ))}
    </div>
  );
}
