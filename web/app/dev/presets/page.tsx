'use client';
import React from 'react';
import { usePresetStore } from '@/store/presetStore';

export default function PresetsPage() {
  const { presets, activeId, apply, upsert, remove } = usePresetStore();

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-xl font-semibold">UI Presets</h1>

      <section className="space-y-2">
        <h2 className="font-medium">Active</h2>
        <div className="flex flex-wrap gap-2">
          {presets.map(p => (
            <button
              key={p.id}
              className={`btn btn-sm ${activeId === p.id ? 'btn-primary' : ''}`}
              onClick={() => apply(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Edit / Create</h2>
        <PresetEditor
          key={activeId}
          preset={presets.find(p => p.id === activeId)!}
          onSave={(p) => upsert(p)}
          onDelete={() => remove(activeId)}
        />
      </section>
    </div>
  );
}

function PresetEditor({ preset, onSave, onDelete }: {
  preset: any; onSave: (p:any)=>void; onDelete: ()=>void;
}) {
  const [p, setP] = React.useState(preset);

  const update = (path: string, value: any) => {
    setP((prev: any) => {
      const next = structuredClone(prev);
      (path.split('.') as string[]).reduce((o, k, i, arr) => {
        if (i === arr.length - 1) (o as any)[k] = value;
        else (o as any)[k] ??= {};
        return (o as any)[k];
      }, next);
      return next;
    });
  };

  return (
    <div className="rounded-md border p-4 space-y-4">
      <div className="grid gap-2">
        <label className="text-sm">Name</label>
        <input className="input input-sm" value={p.name}
               onChange={(e)=>update('name', e.target.value)} />
      </div>

      <div className="grid gap-2">
        <label className="text-sm">Palette Groups (comma)</label>
        <input className="input input-sm"
               value={(p.palette.groups ?? []).join(',')}
               onChange={(e)=>update('palette.groups', e.target.value.split(',').map((s)=>s.trim()).filter(Boolean))} />
      </div>

      <div className="grid gap-2">
        <label className="text-sm">Include IDs (comma)</label>
        <input className="input input-sm"
               value={(p.palette.include ?? []).join(',')}
               onChange={(e)=>update('palette.include', e.target.value.split(',').map((s)=>s.trim()).filter(Boolean))} />
      </div>

      <div className="grid gap-2">
        <label className="text-sm">Exclude IDs (comma)</label>
        <input className="input input-sm"
               value={(p.palette.exclude ?? []).join(',')}
               onChange={(e)=>update('palette.exclude', e.target.value.split(',').map((s)=>s.trim()).filter(Boolean))} />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={p.chrome.header}
                 onChange={(e)=>update('chrome.header', e.target.checked)} />
          Header
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={p.chrome.footer}
                 onChange={(e)=>update('chrome.footer', e.target.checked)} />
          Footer
        </label>
      </div>

      <div className="flex gap-2">
        <button className="btn btn-sm btn-primary" onClick={()=>onSave(p)}>Save</button>
        <button className="btn btn-sm" onClick={()=>onSave({ ...p, id: crypto.randomUUID(), name: p.name + ' (copy)' })}>Save as copy</button>
        <button className="btn btn-sm btn-danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}
