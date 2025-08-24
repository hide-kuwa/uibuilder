"use client";

import { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { useEditorStore } from "@/store/editorStore";
import type { InstanceNode, ComponentProp } from "@/types/editor";
import { isCompatible } from "@/lib/override/compat";
import { listOverridable } from "@/lib/override/util";
import { findNode } from "@/lib/tree";

export default function RightPane() {
  const selectedId = useEditorStore((s) => s.selectedIds[0]);
  const node = useEditorStore((s) => findNode(s.tree, selectedId || ""));
  if (!node || node.type !== "Instance") return null;

  const inst = node as InstanceNode;
  const components = useEditorStore((s) => s.components);
  const component = components[inst.defId || inst.componentId];
  const swap = useEditorStore((s) => s.swapInstanceDef);
  const addComponentProp = useEditorStore((s) => s.addComponentProp);
  const setInstanceProp = useEditorStore((s) => s.setInstanceProp);
  const setOverride = useEditorStore((s) => s.setOverride);
  const clearOverride = useEditorStore((s) => s.clearOverride);
  const clearAllOverrides = useEditorStore((s) => s.clearAllOverrides);
  const tree = useEditorStore((s) => s.tree);

  const overrideTargets = useMemo(() => {
    if (!component) return [] as { id: string; type: string; name?: string }[];
    const root = findNode(tree, component.rootId);
    return root ? listOverridable(root) : [];
  }, [component, tree]);

  const [targetId, setTargetId] = useState<string>(overrideTargets[0]?.id || "");

  const curr = component;
  const opts = Object.values(components).filter(
    (c) => curr && isCompatible(curr, c),
  );

  const handleAdd = () => {
    const name = prompt("Prop name?");
    if (!name) return;
    const type =
      (prompt(
        "Type (boolean,text,number,color)",
        "text",
      ) as ComponentProp["type"]) || "text";
    const id = nanoid();
    const defVal =
      type === "boolean"
        ? false
        : type === "number"
        ? 0
        : type === "color"
        ? "#000000"
        : "";
    addComponentProp(inst.defId || inst.componentId, {
      id,
      name,
      type,
      default: defVal,
    });
  };

  const targetType = overrideTargets.find((o) => o.id === targetId)?.type;
  const textVal = inst.overrides?.text?.[targetId]?.text || "";
  const imageVal = inst.overrides?.image?.[targetId]?.assetId || "";
  const visibleVal = !(inst.overrides?.visible?.[targetId] ?? false);
  const colorVal = inst.overrides?.style?.[targetId]?.fill || "#000000";

  return (
    <div className="bg-gray-800 p-2 space-y-4 text-xs">
      {component && (
        <div>
          <div className="font-bold">Props</div>
          {component.props?.map((p) => (
            <div key={p.id} className="flex items-center gap-1">
              <label className="flex-1">{p.name}</label>
              {p.type === "boolean" ? (
                <input
                  type="checkbox"
                  checked={inst.propValues?.[p.id] ?? p.default ?? false}
                  onChange={(e) =>
                    setInstanceProp(inst.id, p.id, e.target.checked)
                  }
                />
              ) : p.type === "number" ? (
                <input
                  type="number"
                  className="w-full bg-gray-700 p-1 text-white"
                  value={inst.propValues?.[p.id] ?? p.default ?? 0}
                  onChange={(e) =>
                    setInstanceProp(inst.id, p.id, Number(e.target.value))
                  }
                />
              ) : p.type === "color" ? (
                <input
                  type="color"
                  value={inst.propValues?.[p.id] ?? p.default ?? "#000000"}
                  onChange={(e) =>
                    setInstanceProp(inst.id, p.id, e.target.value)
                  }
                />
              ) : (
                <input
                  type="text"
                  className="w-full bg-gray-700 p-1 text-white"
                  value={inst.propValues?.[p.id] ?? p.default ?? ""}
                  onChange={(e) =>
                    setInstanceProp(inst.id, p.id, e.target.value)
                  }
                />
              )}
            </div>
          ))}
          <button className="p-1 bg-gray-700" onClick={handleAdd}>
            + Prop
          </button>
        </div>
      )}

      <div>
        <div className="font-bold">Instance</div>
        <label className="block">
          Swap
          <select
            className="w-full bg-gray-700 p-1 text-white"
            value={inst.defId || inst.componentId}
            onChange={(e) => swap(inst.id, e.target.value)}
          >
            {opts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <div className="font-bold flex items-center">
          Overrides
          <button
            className="ml-auto px-1 bg-gray-700"
            onClick={() => clearAllOverrides(inst.id)}
          >
            Reset All
          </button>
        </div>
        {overrideTargets.length > 0 && (
          <div className="space-y-1 mt-1">
            <select
              className="w-full bg-gray-700 p-1 text-white"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
            >
              {overrideTargets.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.type}
                  {o.name ? `: ${o.name}` : ""}
                </option>
              ))}
            </select>

            {targetType === "Text" && (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  className="flex-1 bg-gray-700 p-1 text-white"
                  value={textVal}
                  onChange={(e) =>
                    setOverride(inst.id, "text", targetId, { text: e.target.value })
                  }
                />
                <button
                  className="px-1 bg-gray-700"
                  onClick={() => clearOverride(inst.id, "text", targetId)}
                >
                  Reset
                </button>
              </div>
            )}

            {targetType === "Image" && (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  className="flex-1 bg-gray-700 p-1 text-white"
                  value={imageVal}
                  onChange={(e) =>
                    setOverride(inst.id, "image", targetId, {
                      assetId: e.target.value,
                    })
                  }
                />
                <button
                  className="px-1 bg-gray-700"
                  onClick={() => clearOverride(inst.id, "image", targetId)}
                >
                  Reset
                </button>
              </div>
            )}

            <div className="flex items-center gap-1">
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={visibleVal}
                  onChange={(e) =>
                    setOverride(inst.id, "visible", targetId, !e.target.checked)
                  }
                />
                Visible
              </label>
              <button
                className="px-1 bg-gray-700"
                onClick={() => clearOverride(inst.id, "visible", targetId)}
              >
                Reset
              </button>
            </div>

            <div className="flex items-center gap-1">
              <input
                type="color"
                value={colorVal}
                onChange={(e) =>
                  setOverride(inst.id, "style", targetId, { fill: e.target.value })
                }
              />
              <button
                className="px-1 bg-gray-700"
                onClick={() => clearOverride(inst.id, "style", targetId)}
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
