"use client";
import { useEditorStore } from "@/store/editorStore";

export function LoadFromCode() {
  const load = async () => {
    const res = await fetch("/api/load-component-tree");
    const data = await res.json();
    useEditorStore.setState((s) => ({ ...s, tree: data.tree }));
  };

  return (
    <button onClick={load} className="px-2 py-1 border rounded">
      既存コードを読み込む
    </button>
  );
}
