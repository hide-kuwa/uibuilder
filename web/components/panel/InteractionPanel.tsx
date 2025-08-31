'use client'
import React from 'react'
import type { Action, ActionMap } from '@/types/actions'

type Props = {
  value: ActionMap | undefined
  onChange: (v: ActionMap) => void
}

function ActionRow({ a, onChange, onDelete }: { a: Action; onChange: (na: Action)=>void; onDelete: ()=>void }) {
  if (a.type === 'openUrl') {
    return (
      <div className="grid grid-cols-5 gap-2 items-center">
        <span className="text-xs">openUrl</span>
        <input className="col-span-3 border p-1 rounded text-sm" placeholder="https://example.com" value={a.url} onChange={(e)=>onChange({ ...a, url: e.target.value })} />
        <select className="border p-1 rounded text-sm" value={a.target || '_self'} onChange={(e)=>onChange({ ...a, target: e.target.value as any })}>
          <option value="_self">_self</option>
          <option value="_blank">_blank</option>
        </select>
        <button className="border rounded px-2 h-7" onClick={onDelete}>Del</button>
      </div>
    )
  }
  if (a.type === 'navigate') {
    return (
      <div className="grid grid-cols-5 gap-2 items-center">
        <span className="text-xs">navigate</span>
        <input className="col-span-3 border p-1 rounded text-sm" placeholder="/about" value={a.path} onChange={(e)=>onChange({ ...a, path: e.target.value })} />
        <div />
        <button className="border rounded px-2 h-7" onClick={onDelete}>Del</button>
      </div>
    )
  }
  return null
}

export function InteractionPanel({ value, onChange }: Props) {
  const list = value?.onClick ?? []
  function add(kind: 'openUrl'|'navigate') {
    const a: Action = kind === 'openUrl' ? { type: 'openUrl', url: '', target: '_self' } : { type: 'navigate', path: '/' }
    onChange({ onClick: [...list, a] })
  }
  return (
    <div className="space-y-2 p-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-gray-500">Interactions: onClick</div>
        <div className="flex items-center gap-1">
          <button className="border rounded px-2 h-7" onClick={()=>add('openUrl')}>+ openUrl</button>
          <button className="border rounded px-2 h-7" onClick={()=>add('navigate')}>+ navigate</button>
        </div>
      </div>
      {list.length === 0 ? (
        <div className="text-xs text-gray-500">No actions</div>
      ) : (
        <div className="space-y-2">
          {list.map((a, i)=>(
            <ActionRow
              key={i}
              a={a}
              onChange={(na)=>onChange({ onClick: list.map((x,idx)=> idx===i ? na : x) })}
              onDelete={()=>onChange({ onClick: list.filter((_,idx)=> idx!==i) })}
            />
          ))}
        </div>
      )}
    </div>
  )
}
