'use client'
import * as React from 'react'
import { useActionDebugStore } from '@/store/actionDebugStore'

export default function ActionDevConsole() {
  const { enabled, intercept, entries, filters, toggleEnabled, setIntercept, clear, setFilters } = useActionDebugStore()
  React.useEffect(()=>{
    const onKey = (e: KeyboardEvent) => {
      const mod = (e.ctrlKey||e.metaKey) && e.shiftKey && e.key.toLowerCase()==='a'
      if (mod) { e.preventDefault(); toggleEnabled() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleEnabled])

  const filtered = entries.filter(e =>
    (!filters.nodeId || e.nodeId===filters.nodeId) &&
    (!filters.trigger || e.trigger===filters.trigger) &&
    (!filters.kind || e.actions.some(a=>a.kind===filters.kind))
  )

  const replay = (row:any) => {
    window.dispatchEvent(new CustomEvent('actions:test', { detail: { nodeId: row.nodeId, trigger: row.trigger } }))
  }

  if (!enabled) return null
  return (
    <div className="fixed right-3 bottom-3 z-[1000] w-[560px] h-[320px] bg-zinc-900/95 border border-zinc-700 rounded-lg shadow-xl backdrop-blur p-2 text-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="font-medium">Actions Debug</div>
        <label className="ml-2 flex items-center gap-1">
          <input type="checkbox" checked={enabled} onChange={()=>toggleEnabled()} /> Enable
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={intercept} onChange={e=>setIntercept(e.currentTarget.checked)} /> Intercept nav/url
        </label>
        <button className="ml-auto px-2 py-1 bg-zinc-800 rounded" onClick={clear}>Clear</button>
      </div>
      <div className="flex gap-2 mb-2">
        <input className="bg-zinc-800 rounded px-2 py-1 flex-1" placeholder="Filter nodeId" value={filters.nodeId ?? ''} onChange={e=>setFilters({nodeId:e.currentTarget.value||undefined})}/>
        <select className="bg-zinc-800 rounded px-2 py-1" value={filters.trigger ?? ''} onChange={e=>setFilters({trigger:(e.target.value||undefined) as any})}>
          <option value="">trigger: any</option>
          <option>click</option><option>doubleClick</option><option>mount</option><option>delay</option><option>inView</option>
        </select>
        <select className="bg-zinc-800 rounded px-2 py-1" value={filters.kind ?? ''} onChange={e=>setFilters({kind:(e.target.value||undefined) as any})}>
          <option value="">kind: any</option>
          <option>openUrl</option><option>navigate</option><option>emitEvent</option><option>setProp</option>
        </select>
      </div>
      <div className="h-[240px] overflow-auto rounded border border-zinc-800">
        <table className="w-full text-xs">
          <thead className="bg-zinc-800/80 sticky top-0">
            <tr><th className="text-left p-2 w-16">Δms</th><th className="text-left p-2">trigger</th><th className="text-left p-2">node</th><th className="text-left p-2">actions</th><th className="p-2 w-16"> </th></tr>
          </thead>
          <tbody>
            {filtered.map(row=> (
              <tr key={row.id} className="border-t border-zinc-800 hover:bg-zinc-800/40">
                <td className="p-2">{Math.round((row.t1??row.t0)-row.t0)}</td>
                <td className="p-2">{row.trigger}</td>
                <td className="p-2">{row.nodeId}</td>
                <td className="p-2">{row.actions.map(a=>a.kind).join(', ')}</td>
                <td className="p-2">
                  <button className="px-2 py-1 bg-zinc-800 rounded" onClick={()=>replay(row)}>Replay</button>
                </td>
              </tr>
            ))}
            {filtered.length===0 && <tr><td className="p-4 text-center text-zinc-500" colSpan={5}>No entries</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
