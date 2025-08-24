"use client";

import { useMemo, useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { useEditorStore } from "@/store/editorStore";
import type {
  InstanceNode,
  ComponentProp,
  VariantPropDef,
  PrototypeLink,
} from "@/types/editor";
import { mapNodesForSwap } from "@/lib/override/compat";
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
  const updateNode = useEditorStore((s) => s.updateNode);
  const frames = useEditorStore((s) => s.tree.filter((n) => n.type === "Frame"));
  const link = inst.prototypeLink;
  const [linkKind, setLinkKind] = useState(link?.kind || "");
  const [linkTarget, setLinkTarget] = useState(link?.targetId || "");
  const [triggerType, setTriggerType] = useState(link?.trigger?.type || 'click');
  const [triggerMs, setTriggerMs] = useState(link?.trigger?.ms ?? 300);
  useEffect(() => {
    setLinkKind(link?.kind || "");
    setLinkTarget(link?.targetId || "");
    setTriggerType(link?.trigger?.type || 'click');
    setTriggerMs(link?.trigger?.ms ?? 300);
  }, [link?.kind, link?.targetId, link?.trigger?.type, link?.trigger?.ms]);
  const triggerObj = () =>
    ({ type: triggerType as any, ...(triggerType === 'delay' ? { ms: triggerMs } : {}) });
  const handleKindChange = (k: string) => {
    setLinkKind(k);
    if (!k) updateNode(inst.id, { prototypeLink: undefined });
    else
      updateNode(inst.id, {
        prototypeLink: {
          kind: k as PrototypeLink["kind"],
          targetId: linkTarget,
          trigger: triggerObj(),
        },
      });
  };
  const handleTargetChange = (t: string) => {
    setLinkTarget(t);
    updateNode(inst.id, {
      prototypeLink: {
        kind: linkKind as PrototypeLink["kind"],
        targetId: t,
        trigger: triggerObj(),
      },
    });
  };
  const handleTriggerChange = (t: string) => {
    setTriggerType(t);
    updateNode(inst.id, {
      prototypeLink: {
        kind: linkKind as PrototypeLink['kind'],
        targetId: linkTarget,
        trigger: { type: t as any, ...(t === 'delay' ? { ms: triggerMs } : {}) },
      },
    });
  };
  const handleTriggerMsChange = (ms: number) => {
    setTriggerMs(ms);
    updateNode(inst.id, {
      prototypeLink: {
        kind: linkKind as PrototypeLink['kind'],
        targetId: linkTarget,
        trigger: { type: 'delay', ms },
      },
    });
  };

  const overrideTargets = useMemo(() => {
    if (!component) return [] as { id: string; type: string; name?: string }[];
    const root = findNode(tree, component.rootId);
    return root ? listOverridable(root) : [];
  }, [component, tree]);

  const [targetId, setTargetId] = useState<string>(overrideTargets[0]?.id || "");
  const [swapId, setSwapId] = useState(inst.defId || inst.componentId);
  const [variantProps, setVariantProps] = useState<Record<string, any>>({});
  const variantSets = useEditorStore((s) => s.variantSets);

  const curr = component;
  const opts = useMemo(() => {
    if (!curr) return [] as typeof components[keyof typeof components][];
    const state = useEditorStore.getState();
    return Object.values(components).filter((c) =>
      mapNodesForSwap(state, curr.rootId, c.rootId).ok,
    );
  }, [components, curr]);

  const currSet = curr?.variantSetId ? variantSets[curr.variantSetId] : null;
  const nextDef = components[swapId];
  const nextSet = nextDef?.variantSetId
    ? variantSets[nextDef.variantSetId]
    : null;
  const sharedPropDefs = useMemo<VariantPropDef[]>(() => {
    if (!currSet || !nextSet) return [];
    const currNames = new Set(currSet.propDefs.map((p) => p.name));
    return nextSet.propDefs.filter((p) => currNames.has(p.name));
  }, [currSet, nextSet]);
  useEffect(() => {
    const next: Record<string, any> = {};
    sharedPropDefs.forEach((p) => {
      if (inst.variantProps && inst.variantProps[p.name] !== undefined)
        next[p.name] = inst.variantProps[p.name];
      else if (p.default !== undefined) next[p.name] = p.default;
    });
    setVariantProps(next);
  }, [swapId, inst.variantProps, sharedPropDefs]);

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
      defaultValue: defVal,
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
                  checked={inst.propValues?.[p.id] ?? p.defaultValue ?? false}
                  onChange={(e) =>
                    setInstanceProp(inst.id, p.id, e.target.checked)
                  }
                />
              ) : p.type === "number" ? (
                <input
                  type="number"
                  className="w-full bg-gray-700 p-1 text-white"
                  value={inst.propValues?.[p.id] ?? p.defaultValue ?? 0}
                  onChange={(e) =>
                    setInstanceProp(inst.id, p.id, Number(e.target.value))
                  }
                />
              ) : p.type === "color" ? (
                <input
                  type="color"
                  value={inst.propValues?.[p.id] ?? p.defaultValue ?? "#000000"}
                  onChange={(e) =>
                    setInstanceProp(inst.id, p.id, e.target.value)
                  }
                />
              ) : (
                <input
                  type="text"
                  className="w-full bg-gray-700 p-1 text-white"
                  value={inst.propValues?.[p.id] ?? p.defaultValue ?? ""}
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
        <div className="font-bold">Swap</div>
        <select
          className="w-full bg-gray-700 p-1 text-white"
          value={swapId}
          onChange={(e) => setSwapId(e.target.value)}
        >
          {opts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {sharedPropDefs.length > 0 && (
          <div className="mt-1 space-y-1">
            {sharedPropDefs.map((p) => (
              <label key={p.name} className="block">
                {p.name}
                {p.type === 'BOOLEAN' ? (
                  <input
                    type="checkbox"
                    className="ml-1"
                    checked={!!variantProps[p.name]}
                    onChange={(e) =>
                      setVariantProps({ ...variantProps, [p.name]: e.target.checked })
                    }
                  />
                ) : p.type === 'NUMBER' ? (
                  <input
                    type="number"
                    className="w-full bg-gray-700 p-1 text-white"
                    value={variantProps[p.name] ?? ''}
                    onChange={(e) =>
                      setVariantProps({
                        ...variantProps,
                        [p.name]: Number(e.target.value),
                      })
                    }
                  />
                ) : p.type === 'ENUM' && p.options ? (
                  <select
                    className="w-full bg-gray-700 p-1 text-white"
                    value={variantProps[p.name] ?? ''}
                    onChange={(e) =>
                      setVariantProps({ ...variantProps, [p.name]: e.target.value })
                    }
                  >
                    {p.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="w-full bg-gray-700 p-1 text-white"
                    value={variantProps[p.name] ?? ''}
                    onChange={(e) =>
                      setVariantProps({ ...variantProps, [p.name]: e.target.value })
                    }
                  />
                )}
              </label>
            ))}
          </div>
        )}
        <button
          className="mt-1 px-1 bg-gray-700"
          onClick={() => swap(inst.id, swapId, { variantProps })}
        >
          Swap
        </button>
      </div>

      <div>
        <div className="font-bold">Link</div>
        <select
          className="w-full bg-gray-700 p-1 text-white"
          value={linkKind}
          onChange={(e) => handleKindChange(e.target.value)}
        >
          <option value="">None</option>
          <option value="navigate">Link To</option>
          <option value="overlay">Overlay</option>
          <option value="back">Back</option>
        </select>
        {(linkKind === "navigate" || linkKind === "overlay") && (
          <select
            className="w-full bg-gray-700 p-1 text-white mt-1"
            value={linkTarget}
            onChange={(e) => handleTargetChange(e.target.value)}
          >
            {frames.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name || f.id}
              </option>
            ))}
          </select>
        )}
        <div className="mt-1">
          <label className="block">Trigger</label>
          <div className="flex items-center gap-1">
            <select
              className="flex-1 bg-gray-700 p-1 text-white"
              value={triggerType}
              onChange={(e) => handleTriggerChange(e.target.value)}
            >
              <option value="click">click</option>
              <option value="hover">hover</option>
              <option value="delay">delay</option>
            </select>
            {triggerType === 'delay' && (
              <input
                type="number"
                min={0}
                className="w-16 bg-gray-700 p-1 text-white"
                value={triggerMs}
                onChange={(e) => handleTriggerMsChange(Number(e.target.value))}
              />
            )}
          </div>
        </div>
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
