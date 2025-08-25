"use client";
import { useEditorStore } from "@/store/editorStore";

export function ExportCode() {
  const tree = useEditorStore((s) => s.tree);

  async function exportCode() {
    const res = await fetch("/api/export-code", {
      method: "POST",
      body: JSON.stringify({ tree }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    alert(`コードを書き出しました！\n${data.path}`);
  }

  return (
    <button onClick={exportCode} className="px-2 py-1 border rounded">
      コードとして保存
    </button>
  );
}
