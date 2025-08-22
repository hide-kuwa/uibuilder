'use client';
import { useEditorStore } from '@/store/editorStore';
import { useState } from 'react';

export default function RightInspector() {
  const selected = useEditorStore((s) => s.selectedIds[0]);
  const node = useEditorStore((s) =>
    s.tree.find((n) => n.id === s.selectedIds[0])
  );
  const update = useEditorStore((s) => s.updateNode);
  const setLayout = useEditorStore((s) => s.setLayoutProps);
  const [form, setForm] = useState({
    x: node?.props?.x || 0,
    y: node?.props?.y || 0,
    w: node?.props?.w || 0,
    h: node?.props?.h || 0,
    rotation: node?.props?.rotation || 0,
  });

  if (!selected) return <div className="bg-gray-800" />;

  const handleChange = (key: keyof typeof form, value: number) => {
    const next = { ...form, [key]: value };
    setForm(next);
    update(selected, { props: next });
  };

  return (
    <div className="bg-gray-800 p-2 space-y-2 overflow-y-auto">
      {(['x', 'y', 'w', 'h', 'rotation'] as const).map((k) => (
        <label key={k} className="block text-xs">
          {k.toUpperCase()}:
          <input
            type="number"
            className="w-full bg-gray-700 ml-1 p-1 text-white"
            value={form[k]}
            onChange={(e) => handleChange(k, Number(e.target.value))}
          />
        </label>
      ))}
      <div className="mt-2 space-y-1">
        <label className="block text-xs">
          Layout:
          <select
            className="w-full bg-gray-700 ml-1 p-1 text-white"
            value={node?.props?.layout || 'free'}
            onChange={(e) =>
              setLayout(selected, { layout: e.target.value as any })
            }
          >
            <option value="free">Free</option>
            <option value="auto">Auto</option>
          </select>
        </label>
        {node?.props?.layout === 'auto' && (
          <label className="block text-xs">
            Direction:
            <select
              className="w-full bg-gray-700 ml-1 p-1 text-white"
              value={node?.props?.axis || 'vertical'}
              onChange={(e) =>
                setLayout(selected, { axis: e.target.value as any })
              }
            >
              <option value="horizontal">Row</option>
              <option value="vertical">Column</option>
            </select>
          </label>
        )}
      </div>
    </div>
  );
}
