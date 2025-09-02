'use client';
import * as React from 'react';
import { buildAutoTree, mergeMenu } from '@/lib/menu';
import { useSidebarStore } from '@/store/sidebarStore';
import type { OverlayNode } from '@/types/sidebar';

function AutoPreview() {
  const tree = buildAutoTree();
  return (
    <div className="rounded border p-3">
      <div className="font-medium mb-2">Auto (scan)</div>
      <pre className="text-xs overflow-auto max-h-72">{JSON.stringify(tree, null, 2)}</pre>
    </div>
  );
}

function OverlayEditor({ value, onChange }: { value: OverlayNode[]; onChange: (v: OverlayNode[]) => void; }) {
  const [txt, setTxt] = React.useState(JSON.stringify(value, null, 2));
  return (
    <div className="rounded border p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">Overlay (JSON)</div>
        <button className="btn btn-xs" onClick={() => { try { onChange(JSON.parse(txt)); } catch { alert('JSON parse error'); } }}>
          Apply
        </button>
      </div>
      <textarea className="w-full h-64 font-mono text-xs p-2 rounded border bg-[color:var(--panel2)]"
        value={txt} onChange={(e)=>setTxt(e.target.value)} />
    </div>
  );
}

export default function SidebarDev() {
  const { presets, activeId, apply, upsert, remove } = useSidebarStore();
  const preset = presets.find(p => p.id === activeId)!;
  const merged = React.useMemo(() => mergeMenu(preset), [preset]);

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-xl font-semibold">Sidebar Presets</h1>

      <section className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {presets.map(p => (
            <button key={p.id} className={`btn btn-sm ${p.id===activeId?'btn-primary':''}`} onClick={()=>apply(p.id)}>
              {p.name}
            </button>
          ))}
          <button className="btn btn-sm"
            onClick={()=> upsert({ id: crypto.randomUUID(), name: 'New Preset', mode:'auto+overlay', include:[], exclude:[], overlay:[], rootHidden:false }) }>
            + New
          </button>
          <button className="btn btn-sm btn-danger" onClick={()=>remove(activeId)}>Delete</button>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <AutoPreview />
        <div className="rounded border p-3">
          <div className="font-medium mb-2">Merged (preview)</div>
          <pre className="text-xs overflow-auto max-h-72">{JSON.stringify(merged, null, 2)}</pre>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="rounded border p-3 space-y-3">
          <div className="font-medium">Filters</div>
          <label className="text-sm">Include (comma)</label>
          <input className="input input-sm w-full"
            value={(preset.include??[]).join(',')}
            onChange={(e)=>upsert({ ...preset, include: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })}/>
          <label className="text-sm mt-2">Exclude (comma)</label>
          <input className="input input-sm w-full"
            value={(preset.exclude??[]).join(',')}
            onChange={(e)=>upsert({ ...preset, exclude: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })}/>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!preset.rootHidden}
                onChange={(e)=>upsert({ ...preset, rootHidden: !e.target.checked })}/>
              Show Sidebar
            </label>
          </div>
        </div>

        <OverlayEditor
          value={preset.overlay ?? []}
          onChange={(overlay)=>upsert({ ...preset, overlay })}
        />
      </section>

      <p className="text-xs text-[color:var(--muted)]">
        Overlay は <code>[[{"ref":"/builder","label":"Builder","children":[...]}}]</code> のように、
        参照（ref）で並びと階層を定義します。ref は自動ツリーの id（= パス）に合わせてください。
      </p>
    </div>
  );
}
