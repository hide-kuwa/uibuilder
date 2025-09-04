"use client";
import StatusConfigPanel from "@/components/panels/StatusConfigPanel";
import StatusDropdown from "@/components/panels/StatusDropdown";
import { useBuilderStore } from "@/stores/builder";
import Link from "next/link";

export default function BuilderPage() {
  const nodes = useBuilderStore((s) => s.nodes);
  const setNodeStatus = useBuilderStore((s) => s.setNodeStatus);
  const publishAll = useBuilderStore((s) => s.publishAll);
  const publishedAt = useBuilderStore((s) => s.publishedSnapshot?.at);
  const usePublished = useBuilderStore((s) => s.usePublishedOnMap);
  const setUsePublished = useBuilderStore((s) => s.setUsePublishedOnMap);
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);
  const canUndo = useBuilderStore((s) => s.undoStack.length > 0);
  const canRedo = useBuilderStore((s) => s.redoStack.length > 0);

  const resetStatuses = () => {
    nodes.forEach((n) =>
      setNodeStatus(n.id, { base: "notVisited", overlays: [] })
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Builder</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={usePublished}
              onChange={(e) => setUsePublished(e.target.checked)}
            />
            <span>/map は公開版を使用</span>
          </label>
          <button
            onClick={undo}
            disabled={!canUndo}
            className="px-3 py-2 rounded-lg border disabled:text-zinc-400 disabled:border-zinc-200"
          >
            ↩ Undo
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="px-3 py-2 rounded-lg border disabled:text-zinc-400 disabled:border-zinc-200"
          >
            ↪ Redo
          </button>
          <button
            onClick={resetStatuses}
            className="px-3 py-2 rounded-lg border"
          >
            ステータス初期化
          </button>
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={publishAll}
              className="px-3 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black"
            >
              Publish All
            </button>
            <div className="text-xs text-zinc-500 flex items-center gap-1">
              <span>📅 最終公開:</span>
              <span>
                {publishedAt
                  ? new Date(publishedAt).toLocaleString("ja-JP")
                  : "未公開"}
              </span>
            </div>
          </div>
          <Link href="/map" className="px-3 py-2 rounded-lg border">
            /map
          </Link>
          <Link href="/map?preview=1" className="px-3 py-2 rounded-lg border">
            /map?preview=1
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-4">
          <div className="text-sm text-zinc-500">
            ノードごとのステータス編集
          </div>
          <div className="grid grid-cols-2 gap-4">
            {nodes.map((n) => (
              <div
                key={n.id}
                className="p-3 rounded-xl border bg-white/70 dark:bg-zinc-900/70"
              >
                <div className="mb-2 text-sm font-medium">{n.name ?? n.id}</div>
                <StatusDropdown nodeId={n.id} />
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-4">
          <StatusConfigPanel />
        </div>
      </div>
    </div>
  );
}
