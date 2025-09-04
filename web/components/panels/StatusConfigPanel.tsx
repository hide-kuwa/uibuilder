'use client';
import { useBuilderStore } from '@/stores/builder';
import type { ComposeMode } from '@/types/status';

export default function StatusConfigPanel() {
  const cfg = useBuilderStore((s) => s.statusConfig);
  const setStatusConfig = useBuilderStore((s) => s.setStatusConfig);

  return (
    <div className="space-y-4 p-4 rounded-xl border bg-white/70 dark:bg-zinc-900/70">
      {/* Base configs */}
      <section className="space-y-2">
        <div className="text-xs text-zinc-500">Base</div>
        <div className="flex flex-col gap-2">
          {Object.entries(cfg.base).map(([k, v]) => (
            <div key={k} className="flex items-center gap-2">
              <div className="text-sm w-20">{v.label}</div>
              <input
                type="color"
                value={v.color}
                onChange={(e) =>
                  setStatusConfig((draft) => {
                    draft.base[k as keyof typeof cfg.base].color = e.target.value;
                  })
                }
                className="h-8 w-12 p-0 border rounded"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Overlay configs */}
      <section className="space-y-2">
        <div className="text-xs text-zinc-500">Overlays</div>
        <div className="space-y-3">
          {cfg.overlays.map((o, idx) => (
            <div key={o.key} className="grid grid-cols-12 items-center gap-2">
              <div className="col-span-2 text-sm">{o.label}</div>
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
              <div className="col-span-5">
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
    </div>
  );
}

