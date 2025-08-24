'use client';
import { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import InstanceView from '@/components/editor/InstanceView';
import type { VariantProps } from '@/types/editor';

export default function ComponentsPanel() {
  const components = useEditorStore((s) => Object.values(s.components));
  const createInstance = useEditorStore((s) => s.createInstance);
  const placeInstance = useEditorStore((s) => s.placeInstance);
  const [propsByComp, setPropsByComp] = useState<Record<string, VariantProps>>({});

  return (
    <div className="p-2 space-y-2 overflow-y-auto text-xs">
      {components.map((c) => {
        const vp = propsByComp[c.id] || {};
        const setProp = (k: string, v: string) =>
          setPropsByComp((prev) => ({ ...prev, [c.id]: { ...vp, [k]: v } }));

        return (
          <div
            key={c.id}
            className="border p-2 rounded hover:bg-gray-700 cursor-pointer"
            onClick={() => {
              if (c.variantSet) {
                createInstance(c.id);
              } else {
                placeInstance(c.id);
              }
            }}
          >
            <div className="mb-1 font-medium">{c.name}</div>

            {c.variantSet && (
              <div className="mb-2 space-y-1">
                {Object.entries(c.variantSet.props).map(([prop, values]) => (
                  <select
                    key={prop}
                    value={vp[prop] || values[0]}
                    onChange={(e) => setProp(prop, e.target.value)}
                    className="block w-full border rounded p-1 text-xs bg-black"
                  >
                    {values.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            )}

            {c.variantSet && (
              <div className="border relative mt-1">
                <InstanceView defId={c.id} props={vp} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
