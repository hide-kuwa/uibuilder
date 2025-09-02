"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useBuilderStore } from "@/store/builderStore";
import { PRESETS } from "@/lib/presets";
import { encodeNodeToUrlParam, decodeNodeFromUrlParam } from "@/lib/share";
import type { ComponentNode } from "@/types/editor";

const buildSubtree = (elements: any[], id: string): ComponentNode | null => {
  const el = elements.find((e) => e.id === id);
  if (!el) return null;
  return {
    id: el.id,
    type: el.type,
    props: el.props,
    children: (el.children || [])
      .map((cid: string) => buildSubtree(elements, cid))
      .filter(Boolean) as ComponentNode[],
  } as ComponentNode;
};

function AnimationPresets() {
  const wrap = useBuilderStore((s) => s.wrapSelectedWith);
  const unwrap = useBuilderStore((s) => s.unwrapSelectedIf);
  const replay = useBuilderStore((s) => s.replayAnimationOnSelected);

  const [preset, setPreset] = useState<'pop' | 'fadeUp' | 'cascade'>("pop");
  const [mode, setMode] = useState<'mount' | 'view'>("mount");
  const [duration, setDuration] = useState(700);
  const [delay, setDelay] = useState(0);
  const [stagger, setStagger] = useState(60);
  const [easing, setEasing] = useState("easeOutQuad");
  const [selector, setSelector] = useState(">*");

  const apply = () => {
    const props: any = { preset, duration, delay, easing };
    if (preset === "cascade")
      (props.selector = selector), (props.stagger = stagger);
    wrap(mode === "mount" ? "AnimeOnMount" : "AnimeOnView", props);
  };

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold">Animation Presets</h2>
      <div className="flex flex-wrap gap-2 items-center">
        <select
          className="border rounded px-2 py-1"
          value={preset}
          onChange={(e) => setPreset(e.target.value as any)}
        >
          <option value="pop">pop（scale+fade）</option>
          <option value="fadeUp">fadeUp（下から）</option>
          <option value="cascade">cascade（子を順番に）</option>
        </select>
        <select
          className="border rounded px-2 py-1"
          value={mode}
          onChange={(e) => setMode(e.target.value as any)}
        >
          <option value="mount">on mount</option>
          <option value="view">on view (scroll in)</option>
        </select>
        <label className="text-xs">
          duration
          <input
            className="border rounded px-1 w-20 ml-1"
            type="number"
            value={duration}
            onChange={(e) => setDuration(+e.target.value)}
          />
        </label>
        <label className="text-xs">
          delay
          <input
            className="border rounded px-1 w-16 ml-1"
            type="number"
            value={delay}
            onChange={(e) => setDelay(+e.target.value)}
          />
        </label>
        {preset === "cascade" && (
          <>
            <label className="text-xs">
              stagger
              <input
                className="border rounded px-1 w-16 ml-1"
                type="number"
                value={stagger}
                onChange={(e) => setStagger(+e.target.value)}
              />
            </label>
            <label className="text-xs">
              selector
              <input
                className="border rounded px-1 w-40 ml-1"
                value={selector}
                onChange={(e) => setSelector(e.target.value)}
              />
            </label>
          </>
        )}
        <button className="px-3 py-1 border rounded" onClick={apply}>
          Apply to selection
        </button>
        <button className="px-3 py-1 border rounded" onClick={() => unwrap()}>
          Unwrap
        </button>
        <button className="px-3 py-1 border rounded" onClick={replay}>
          Replay
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        ※ まず Canvas で対象ノードを選択してから適用してください
      </p>
    </section>
  );
}

export default function DevActionsPage() {
  const placePreset = useBuilderStore((s) => s.placePreset);
  const addSubtree = useBuilderStore((s) => s.addSubtree);
  const elements = useBuilderStore((s) => s.elements);
  const selectedId = useBuilderStore((s) => s.selectedIds?.[0]);
  const [importParam, setImportParam] = useState("");

  const selectedNode = useMemo(() => {
    if (!selectedId) return null;
    return buildSubtree(elements, selectedId);
  }, [elements, selectedId]);

  const copyShareUrl = () => {
    if (!selectedNode) return alert("何も選択されていません");
    const param = encodeNodeToUrlParam(selectedNode);
    const url = `${location.origin}${location.pathname}?${param}`;
    navigator.clipboard?.writeText(url);
    alert("Copied share URL!");
  };

  const importFromParam = () => {
    const node = decodeNodeFromUrlParam(importParam);
    if (!node) return alert("Invalid share param");
    addSubtree(node);
    setImportParam("");
    alert("Imported!");
  };

  useEffect(() => {
    const s = new URLSearchParams(location.search).get("s");
    if (!s) return;
    const node = decodeNodeFromUrlParam(s);
    if (node) addSubtree(node);
  }, [addSubtree]);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-lg font-bold">Dev / Actions</h1>

      {PRESETS.map((p) => (
        <button
          key={p.id}
          className="px-3 py-2 border rounded mr-2"
          onClick={() => placePreset(p.id)}
        >
          Place: {p.displayName}
        </button>
      ))}

      <div className="pt-4 space-x-2">
        <button
          className="px-3 py-2 border rounded"
          onClick={copyShareUrl}
          disabled={!selectedNode}
        >
          Copy Share URL（選択ノード）
        </button>
      </div>

      <div className="pt-2 flex gap-2 items-center">
        <input
          className="border rounded px-2 py-1 w-[480px]"
          placeholder="?s=... の Base64"
          value={importParam}
          onChange={(e) => setImportParam(e.target.value)}
        />
        <button className="px-3 py-2 border rounded" onClick={importFromParam}>
          Import
        </button>
      </div>

      <AnimationPresets />
    </div>
  );
}
