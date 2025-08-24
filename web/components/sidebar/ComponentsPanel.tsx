"use client";

import { useMemo, useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import InstanceView from "@/components/editor/InstanceView";
import type { VariantProps } from "@/types/editor";

type SortKey = "az" | "recent" | "usage";

export default function ComponentsPanel() {
  const componentsMap = useEditorStore((s) => s.components);
  const components = Object.values(componentsMap);
  const createInstance = useEditorStore((s) => s.createInstance);
  const placeInstance = useEditorStore((s) => s.placeInstance);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("az");
  const [propsByComp, setPropsByComp] = useState<Record<string, VariantProps>>({});

  const items = useMemo(() => {
    let list = components;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    list = list.slice();
    switch (sort) {
      case "recent":
        list.sort((a, b) => (b.lastUsedAt || 0) - (a.lastUsedAt || 0));
        break;
      case "usage":
        list.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
        break;
      default:
        list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [components, query, sort]);

  return (
    <div className="flex flex-col h-full">
      {/* 検索 & ソートバー */}
      <div className="p-1 flex gap-1 items-center">
        <input
          className="border px-1 text-sm flex-1"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="border text-xs"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
        >
          <option value="az">A-Z</option>
          <option value="recent">Recent</option>
          <option value="usage">Usage</option>
        </select>
      </div>

      {/* コンポーネント一覧 */}
      <div className="flex-1 overflow-auto p-1 space-y-2">
        {items.map((c) => {
          const vp = propsByComp[c.id] || {};
          const setProp = (k: string, v: string) =>
            setPropsByComp((prev) => ({ ...prev, [c.id]: { ...vp, [k]: v } }));

          return (
            <div
              key={c.id}
              className="border p-2 rounded hover:bg-gray-700 cursor-pointer"
              draggable
              onDragStart={(e) => e.dataTransfer.setData("component", c.id)}
              onDoubleClick={() => createInstance(c.id)}
              onClick={() => {
                if (c.variantSet) {
                  createInstance(c.id);
                } else {
                  placeInstance(c.id);
                }
              }}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{c.name}</span>
                <span className="text-xs opacity-70">{c.usageCount || 0}</span>
              </div>

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
    </div>
  );
}
