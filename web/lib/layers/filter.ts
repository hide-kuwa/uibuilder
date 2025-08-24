/**
 * v13-3: レイヤー仮想化（折りたたみ/検索連動）のためのユーティリティ
 *
 * - ツリーを「折りたたみ状態」と「検索語」に合わせてフラット化
 * - 検索語がある場合は、該当ノードの祖先は自動的に展開（折りたたみを無視）
 */

export type LayerRow = {
  id: string
  name: string
  type?: string
  depth: number
  matched: boolean
  pathIds: string[] // 祖先を含むパス
  hasChildren: boolean
}

/** ツリーを走査して、(id, name, type, children[]) を持つノードを処理する */
export function computeLayerRows(
  tree: any[],
  collapsed: Set<string>,
  query: string,
): { rows: LayerRow[]; expandedBecauseSearch: Set<string> } {
  const q = query.trim().toLowerCase()
  const matchedIds = new Set<string>()
  const ancestorsToExpand = new Set<string>()

  // 1) まずマッチを収集し、祖先を展開対象に記録
  traverse(tree, (n, stack) => {
    const id = String(n?.id ?? '')
    if (!id) return
    const name = String(n?.name ?? id)
    const ok = q ? name.toLowerCase().includes(q) : false
    if (ok) {
      matchedIds.add(id)
      // 祖先を展開対象に
      stack.forEach((anc) => ancestorsToExpand.add(anc))
    }
  })

  // 2) 行を構築（検索語ありの時は ancestorsToExpand を優先し展開）
  const rows: LayerRow[] = []
  const effectiveOpen = (id: string) =>
    q ? !ancestorsToExpand.has(id) && !collapsed.has(id) : !collapsed.has(id)

  const walk = (nodes: any[], depth: number, pathIds: string[]) => {
    for (const n of nodes ?? []) {
      const id = String(n?.id ?? '')
      if (!id) continue
      const name = String(n?.name ?? id)
      const type = String(n?.type ?? '')
      const children = Array.isArray(n?.children) ? n.children : []
      const hasChildren = children.length > 0
      const matched = matchedIds.has(id)
      rows.push({ id, name, type, depth, matched, pathIds: [...pathIds, id], hasChildren })
      if (hasChildren && effectiveOpen(id)) {
        walk(children, depth + 1, [...pathIds, id])
      }
    }
  }
  walk(tree, 0, [])

  return { rows, expandedBecauseSearch: ancestorsToExpand }
}

export function highlightSegments(name: string, query: string): Array<{ text: string; hit: boolean }> {
  const q = query.trim()
  if (!q) return [{ text: name, hit: false }]
  const idx = name.toLowerCase().indexOf(q.toLowerCase())
  if (idx < 0) return [{ text: name, hit: false }]
  return [
    { text: name.slice(0, idx), hit: false },
    { text: name.slice(idx, idx + q.length), hit: true },
    { text: name.slice(idx + q.length), hit: false },
  ].filter((seg) => seg.text.length > 0)
}

function traverse(nodes: any[], fn: (n: any, stack: string[]) => void, stack: string[] = []) {
  for (const n of nodes ?? []) {
    const id = String(n?.id ?? '')
    const cur = id ? [...stack, id] : stack
    fn(n, stack)
    if (n?.children) traverse(n.children, fn, cur)
  }
}

