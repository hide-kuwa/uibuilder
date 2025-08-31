'use client'
import React, { useMemo, useState } from 'react'
import { useDataSources, listPaths } from '@/store/dataBindingStore'

function Editor({ name }: { name: string }) {
  const src = useDataSources(s => s.getSource(name))
  const set = useDataSources(s => s.setSource)
  const [text, setText] = useState<string>(()=>JSON.stringify(src ?? {}, null, 2))
  return (
    <div className="space-y-2">
      <textarea className="w-full h-40 border rounded p-2 text-xs font-mono" value={text} onChange={e=>setText(e.target.value)} />
      <div className="flex gap-2">
        <button className="border rounded px-2 h-7" onClick={()=>{
          try {
            const j = JSON.parse(text)
            set(name, j)
          } catch {}
        }}>Apply</button>
        <PathsPreview name={name} />
      </div>
    </div>
  )
}

function PathsPreview({ name }: { name: string }) {
  const src = useDataSources(s => s.getSource(name))
  const paths = useMemo(()=> listPaths(src||{}, 200), [src])
  return (
    <details>
      <summary className="text-xs cursor-pointer">Paths ({paths.length})</summary>
      <div className="mt-1 max-h-40 overflow-auto text-xs font-mono opacity-80">
        {paths.map(p=> <div key={p}>{p}</div>)}
      </div>
    </details>
  )
}

export default function DataSourcesPanel() {
  const sources = useDataSources(s => s.sources)
  const set = useDataSources(s => s.setSource)
  const remove = useDataSources(s => s.removeSource)
  const [name, setName] = useState('project')
  const [url, setUrl] = useState('')

  async function importUrl() {
    try {
      const res = await fetch(url)
      const j = await res.json()
      set(name, j)
    } catch {}
  }

  const names = Object.keys(sources)

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input className="border rounded h-8 px-2 text-sm w-32" value={name} onChange={e=>setName(e.target.value)} placeholder="source name" />
        <button className="border rounded px-2 h-8" onClick={()=>set(name, {})}>Add</button>
      </div>
      <div className="flex gap-2">
        <input className="border rounded h-8 px-2 text-sm flex-1" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com/data.json" />
        <button className="border rounded px-2 h-8" onClick={importUrl}>Import URL</button>
      </div>
      {names.length===0 ? <div className="text-xs opacity-70">No sources</div> : null}
      <div className="space-y-4">
        {names.map(n=> (
          <div key={n} className="border border-zinc-800 rounded p-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-sm font-semibold">{n}</div>
              <button className="ml-auto text-xs border rounded px-2 h-7" onClick={()=>remove(n)}>Remove</button>
            </div>
            <Editor name={n} />
          </div>
        ))}
      </div>
    </div>
  )
}
