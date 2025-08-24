"use client"

import { useMemo, useState } from "react";
import { useEditorStore } from "@/store/editorStore";

type SortKey = "az" | "recent" | "usage";

export default function ComponentsPanel() {
  const components = useEditorStore((s) => s.components);
  const createInstance = useEditorStore((s) => s.createInstance);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("az");

  const items = useMemo(() => {
    let list = Object.values(components);
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
      <div className="flex-1 overflow-auto">
        {items.map((c) => (
          <div
            key={c.id}
            className="p-1 border-b text-sm flex justify-between items-center cursor-pointer"
            draggable
            onDragStart={(e) => e.dataTransfer.setData("component", c.id)}
            onDoubleClick={() => createInstance(c.id)}
          >
            <span>{c.name}</span>
            <span className="text-xs opacity-70">{c.usageCount || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

