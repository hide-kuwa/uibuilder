'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { useBuilderStore } from '@/store/builderStore'
import { PRESETS } from '@/lib/presets'
import { encodeNodeToUrlParam, decodeNodeFromUrlParam } from '@/lib/share'
import type { ComponentNode } from '@/types/editor'

const buildSubtree = (elements: any[], id: string): ComponentNode | null => {
  const el = elements.find((e) => e.id === id)
  if (!el) return null
  return {
    id: el.id,
    type: el.type,
    props: el.props,
    children: (el.children || []).map((cid: string) => buildSubtree(elements, cid)).filter(Boolean) as ComponentNode[],
  } as ComponentNode
}

export default function DevActionsPage() {
  const placePreset = useBuilderStore((s) => s.placePreset)
  const addSubtree = useBuilderStore((s) => s.addSubtree)
  const elements = useBuilderStore((s) => s.elements)
  const selectedId = useBuilderStore((s) => s.selectedIds?.[0])
  const [importParam, setImportParam] = useState('')

  const selectedNode = useMemo(() => {
    if (!selectedId) return null
    return buildSubtree(elements, selectedId)
  }, [elements, selectedId])

  const copyShareUrl = () => {
    if (!selectedNode) return
    const param = encodeNodeToUrlParam(selectedNode)
    const url = `${location.origin}${location.pathname}?${param}`
    navigator.clipboard?.writeText(url)
    alert('Copied share URL!')
  }

  const importFromParam = () => {
    const node = decodeNodeFromUrlParam(importParam.replace(/^s=/, ''))
    if (!node) return alert('Invalid share param')
    addSubtree(node)
  }

  useEffect(() => {
    const s = new URLSearchParams(location.search).get('s')
    if (!s) return
    const node = decodeNodeFromUrlParam(s)
    if (node) addSubtree(node)
  }, [addSubtree])

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-lg font-bold">Dev / Actions / Presets & Share</h1>

      {PRESETS.map((p) => (
        <button key={p.id} className="px-3 py-2 border rounded mr-2" onClick={() => placePreset(p.id)}>
          Place: {p.displayName}
        </button>
      ))}

      <div className="pt-4 space-x-2">
        <button className="px-3 py-2 border rounded" onClick={copyShareUrl} disabled={!selectedNode}>
          Copy Share URL（選択ノード）
        </button>
      </div>

      <div className="pt-2 flex gap-2 items-center">
        <input
          className="border rounded px-2 py-1 w-[480px]"
          placeholder="?s=... の Base64"
          value={importParam}
          onChange={(e) => setImportParam(e.target.value)}
        />
        <button className="px-3 py-2 border rounded" onClick={importFromParam}>
          Import
        </button>
      </div>
    </div>
  )
}

