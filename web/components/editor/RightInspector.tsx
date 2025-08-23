'use client';
import { useEditorStore } from '@/store/editorStore';
import { useState } from 'react';

export default function RightInspector() {
  const selected = useEditorStore((s) => s.selectedIds[0]);
  const node = useEditorStore((s) =>
    s.tree.find((n) => n.id === s.selectedIds[0])
  );
  const components = useEditorStore((s) => s.components);
  const update = useEditorStore((s) => s.updateNode);
  const setLayout = useEditorStore((s) => s.setLayoutProps);
  const setVariant = useEditorStore((s) => s.setInstanceVariant);
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

  const comp = node && (node as any).type === 'Instance'
    ? components[(node as any).componentId]
    : null;

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
      {comp && comp.axes && (
        <div className="mt-2 space-y-1">
          <h3 className="text-xs font-bold">Variants</h3>
          {Object.entries(comp.axes).map(([axis, vals]) => (
            <label key={axis} className="block text-xs">
              {axis}:
              <select
                className="w-full bg-gray-700 ml-1 p-1 text-white"
                value={(node as any).variant?.[axis] || vals[0]}
                onChange={(e) =>
                  setVariant(selected, axis, e.target.value)
                }
              >
                {vals.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}
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
        <div className="mt-2 space-y-1">
          <h3 className="text-xs font-bold">Constraints</h3>
          <label className="block text-xs">
            Horizontal:
            <select
              className="w-full bg-gray-700 ml-1 p-1 text-white"
              value={node?.props?.constraints?.horizontal || 'LEFT'}
              onChange={(e) =>
                update(selected, {
                  props: {
                    ...(node?.props || {}),
                    constraints: {
                      ...(node?.props?.constraints || { vertical: 'TOP', horizontal: 'LEFT' }),
                      horizontal: e.target.value as any,
                    },
                  },
                })
              }
            >
              {['LEFT', 'RIGHT', 'LEFT_RIGHT', 'CENTER', 'SCALE'].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs">
            Vertical:
            <select
              className="w-full bg-gray-700 ml-1 p-1 text-white"
              value={node?.props?.constraints?.vertical || 'TOP'}
              onChange={(e) =>
                update(selected, {
                  props: {
                    ...(node?.props || {}),
                    constraints: {
                      ...(node?.props?.constraints || { vertical: 'TOP', horizontal: 'LEFT' }),
                      vertical: e.target.value as any,
                    },
                  },
                })
              }
            >
              {['TOP', 'BOTTOM', 'TOP_BOTTOM', 'CENTER', 'SCALE'].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
