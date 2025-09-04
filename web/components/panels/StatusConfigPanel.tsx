"use client";
import { useBuilderStore } from "@/stores/builder";
import type { BaseKind, ComposeMode, OverlayKind } from "@/types/status";

const BASE_LABELS: Record<BaseKind, string> = {
  visited: "🏠 行った",
  live: "🧍‍♂️ 住んでる",
  notVisited: "❌ 行ってない",
};

const OVERLAY_LABELS: Record<OverlayKind, string> = {
  want: "✈️ 行きたい",
  photo: "📷 写真あり",
};

export default function StatusConfigPanel() {
  const cfg = useBuilderStore((s) => s.statusConfig);
  const setStatusConfig = useBuilderStore((s) => s.setStatusConfig);

  return (
    <div className="p-4 rounded-xl border bg-white/70 dark:bg-zinc-900/70">
      {/* Overlay configs */}
      <section className="mb-4">
        <div className="text-xs text-zinc-500 mb-2">Overlays</div>
        <div className="space-y-3">
          {cfg.overlays.map((o, idx) => (
            <div key={o.key} className="grid grid-cols-12 items-center gap-2">
              <div className="col-span-3 text-sm flex items-center gap-1">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: o.color }}
                />
                {OVERLAY_LABELS[o.key]}
              </div>
              <div className="col-span-2">
                <input
                  type="color"
                  value={o.color}
                  onChange={(e) =>
                    setStatusConfig((draft) => {
                      draft.overlays[idx].color = e.target.value;
                    })
                  }
                  className="h-8 w-12 p-0 border rounded"
                />
              </div>
              <div className="col-span-3">
                <label className="text-xs text-zinc-500 block">priority</label>
                <input
                  type="number"
                  value={o.priority}
                  onChange={(e) =>
                    setStatusConfig((draft) => {
                      draft.overlays[idx].priority = Number(e.target.value);
                    })
                  }
                  className="h-8 px-2 w-full rounded border bg-white/60 dark:bg-zinc-800"
                />
              </div>
              <div className="col-span-4">
                <label className="text-xs text-zinc-500 block">mode</label>
                <select
                  value={o.mode}
                  onChange={(e) =>
                    setStatusConfig((draft) => {
                      draft.overlays[idx].mode = e.target.value as ComposeMode;
                    })
                  }
                  className="h-8 px-2 w-full rounded border bg-white/60 dark:bg-zinc-800"
                >
                  <option value="blend">blend</option>
                  <option value="override">override</option>
                  <option value="glow">glow</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Base configs */}
      <section className="mt-6">
        <div className="text-xs text-zinc-500 mb-2">Base</div>
        <div className="flex flex-col gap-2">
          {Object.entries(cfg.base).map(([k, v]) => (
            <div key={k} className="flex items-center gap-2">
              <div className="text-sm w-28 flex items-center gap-1">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: v.color }}
                />
                {BASE_LABELS[k as BaseKind]}
              </div>
              <input
                type="color"
                value={v.color}
                onChange={(e) =>
                  setStatusConfig((draft) => {
                    draft.base[k as BaseKind].color = e.target.value;
                  })
                }
                className="h-8 w-12 p-0 border rounded"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
