// Minimal shallow merge for style: arrays replace, objects shallow-merge
function mergeStyle(prev: any, patch: any) {
  const out: any = { ...(prev ?? {}) }
  for (const k of Object.keys(patch ?? {})) {
    const v: any = (patch as any)[k]
    out[k] = Array.isArray(v)
      ? v.slice()
      : (typeof v === 'object' && v)
        ? { ...(out[k] ?? {}), ...v }
        : v
  }
  return out
}

type ApplyStyle = (patch: Partial<{
  fill: any; stroke: any; strokeWidth: any; opacity: any; radius: any; shadows: any
}>) => void

export function installMutBridge(opts: {
  getSelectedIds: () => string[]
  getNodeById: (id: string) => any
  updateNode: (id: string, patch: any) => void
}) {
  const w = (typeof window !== 'undefined' ? window : ({} as any)) as any
  w.__mut = w.__mut ?? {}

  const applyStyle: ApplyStyle = (patch) => {
    try {
      const ids = opts.getSelectedIds()
      if (!ids?.length) return
      ids.forEach((id) => {
        const node = opts.getNodeById(id)
        const nextStyle = mergeStyle(node?.style, patch)
        opts.updateNode(id, { style: nextStyle })
      })
    } catch {}
  }

  w.__mut.applyStyle = applyStyle

  // Low-level API to apply style to specific ids
  w.__mut.applyStyleTo = (ids: string[], patch: any) => {
    try {
      if (!ids?.length) return
      ids.forEach((id: string) => {
        const node = opts.getNodeById(id)
        const nextStyle = mergeStyle(node?.style, patch)
        opts.updateNode(id, { style: nextStyle })
      })
    } catch {}
  }
}
