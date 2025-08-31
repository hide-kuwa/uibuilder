'use client'
import React, { useState } from 'react'
import { useBuilderStore } from '@/store/builderStore'

export default function ProjectMetaMenu() {
  const meta = useBuilderStore(s => (s as any).meta || { id: 'local', name: 'Local Project' })
  const setElements = useBuilderStore(s => s.setElements)
  const [id, setId] = useState<string>(meta.id || 'local')
  const [name, setName] = useState<string>(meta.name || 'Local Project')
  function apply() {
    useBuilderStore.setState({ elements: useBuilderStore.getState().elements, meta: { id, name } })
  }
  return (
    <div className="flex items-center gap-2">
      <input className="border rounded h-7 px-2 w-32 text-xs" value={id} onChange={(e)=>setId(e.target.value)} placeholder="project id" />
      <input className="border rounded h-7 px-2 w-40 text-xs" value={name} onChange={(e)=>setName(e.target.value)} placeholder="project name" />
      <button className="border rounded px-2 h-7" onClick={apply}>Apply</button>
    </div>
  )
}
