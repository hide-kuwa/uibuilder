'use client';
import { useEditorStore } from '@/store/editorStore';
import { useState, useEffect, useRef } from 'react';
import ActionPresetField from '@/components/props/ActionPresetField';
import { useUnitStore } from '@/store/unitStore';
import { worldToUnit, unitToWorld } from '@/lib/units';
import AutoPropsForm from '@/components/props/AutoPropsForm';
import { registry } from '@/lib/registry.ts';
import PresetApplyBar from '@/components/props/PresetApplyBar';

export default function RightInspector() {
  const selected = useEditorStore((s) => s.selectedIds[0]);
  const node = useEditorStore((s) =>
    s.tree.find((n) => n.id === s.selectedIds[0])
  );
  const components = useEditorStore((s) => s.components);
  const update = useEditorStore((s) => s.updateNode);
  const setLayout = useEditorStore((s) => s.setLayoutProps);
  const setVariant = useEditorStore((s) => s.setInstanceVariant);
  const { unit, remBase, percentBase } = useUnitStore((s) => ({
    unit: s.unit,
    remBase: s.remBase,
    percentBase: s.percentBase,
  }));
  const [form, setForm] = useState({
    x: node?.props?.x || 0,
    y: node?.props?.y || 0,
    w: node?.props?.w || 0,
    h: node?.props?.h || 0,
    rotation: node?.props?.rotation || 0,
  });

  const meta = node ? (registry as any)[(node as any).type]?.meta : null;
  const [formProps, setFormProps] = useState(() => {
    if (meta?.propertySchema?.kind === 'object') {
      const keys = Object.keys(meta.propertySchema.properties);
      const out: any = {};
      for (const k of keys) out[k] = (node?.props || {})[k];
      return out;
    }
    return {};
  });
  useEffect(() => {
    if (meta?.propertySchema?.kind === 'object') {
      const keys = Object.keys(meta.propertySchema.properties);
      const out: any = {};
      for (const k of keys) out[k] = (node?.props || {})[k];
      setFormProps(out);
    } else {
      setFormProps({});
    }
  }, [node?.id, meta?.propertySchema]);

  const debounced = useRef<number | undefined>(undefined);
  const apply = (next: any) => {
    setFormProps(next);
    window.clearTimeout(debounced.current);
    debounced.current = window.setTimeout(() => {
      update(selected, { props: { ...(node?.props || {}), ...next } });
    }, 150);
  };

  if (!selected) return <div className="bg-gray-800" />;

  const handleChange = (key: keyof typeof form, value: number) => {
    let pxValue = value;
    if (key !== 'rotation') {
      const base = key === 'x' || key === 'w' ? percentBase.width : percentBase.height;
      pxValue = unitToWorld(value, unit, base, remBase);
    }
    const next = { ...form, [key]: pxValue };
    setForm(next);
    // 既存 props を保持して上書き
    update(selected, { props: { ...(node?.props || {}), ...next } });
  };

  const comp = node && (node as any).type === 'Instance'
    ? components[(node as any).componentId]
    : null;

  const unitLabel = unit === 'percent' ? '%' : unit;

  return (
    <div className="td-form-scope bg-gray-800 p-2 space-y-2 overflow-y-auto">
      {(['x', 'y', 'w', 'h', 'rotation'] as const).map((k) => {
        const base = k === 'x' || k === 'w' ? percentBase.width : percentBase.height
        const value =
          k === 'rotation'
            ? form[k]
            : worldToUnit(form[k], unit, base, remBase)
        return (
          <label key={k} className="block text-xs">
            {k.toUpperCase()} {k !== 'rotation' ? `(${unitLabel})` : ''}:
            <input
              type="number"
              className="w-full bg-gray-700 ml-1 p-1 text-white"
              value={value}
              onChange={(e) => handleChange(k, Number(e.target.value))}
            />
          </label>
        )
      })}
      {meta?.propertySchema && (
        <div className="mt-3">
          <div className="mb-1 text-xs text-neutral-300">Properties</div>
          <AutoPropsForm
            value={formProps}
            schema={meta.propertySchema}
            onChange={apply}
          />
        </div>
      )}
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
          <div className="space-y-1">
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
            <label className="block text-xs">
              Wrap:
              <input
                type="checkbox"
                className="ml-1"
                checked={node?.props?.wrap || false}
                onChange={(e) =>
                  setLayout(selected, { wrap: e.target.checked })
                }
              />
            </label>
            {node?.props?.wrap && (
              <label className="block text-xs">
                Max per line:
                <input
                  type="number"
                  className="w-full bg-gray-700 ml-1 p-1 text-white"
                  value={node?.props?.maxPerLine ?? 0}
                  onChange={(e) =>
                    setLayout(selected, {
                      maxPerLine: Number(e.target.value),
                    })
                  }
                />
              </label>
            )}
          </div>
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
      {node && (
        <>
          <ActionPresetField
            nodeId={node.id}
            value={node.props?.presetId ?? (node.props?.presetIds?.[0] ?? '')}
          />
          <PresetApplyBar />
        </>
      )}
    </div>
  );
}
