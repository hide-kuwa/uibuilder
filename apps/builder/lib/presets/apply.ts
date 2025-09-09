// apps/builder/lib/presets/apply.ts
import type { Preset, PresetOp } from './types'

function deepClone<T>(x: T): T { try { return structuredClone(x) } catch { return JSON.parse(JSON.stringify(x)) } }

function walk(node: any, fn: (n: any, parent: any | null, index: number) => void, parent: any | null = null) {
  if (!node) return
  const children: any[] = Array.isArray(node.children) ? node.children : []
  fn(node, parent, -1)
  for (let i = 0; i < children.length; i++) walk(children[i], fn, node)
}

function findById(root: any, id: string): { node: any; parent: any | null; index: number } | null {
  let found: { node: any; parent: any | null; index: number } | null = null
  const visit = (n: any, parent: any | null) => {
    if (n?.id === id) {
      found = { node: n, parent, index: parent && Array.isArray(parent.children) ? parent.children.indexOf(n) : -1 }
    }
    const ch: any[] = Array.isArray(n?.children) ? n.children : []
    for (const c of ch) visit(c, n)
  }
  visit(root, null)
  return found
}

function newId(id: string, used: Set<string>): string {
  if (!used.has(id)) return id
  let i = 1
  while (used.has(`${id}_${i}`)) i++
  return `${id}_${i}`
}

export function applyPreset(tree: any, preset: Preset): { nextTree: any; diffText: string } {
  const next = deepClone(tree)
  const used = new Set<string>()
  walk(next, (n) => { if (n?.id) used.add(n.id) })
  const idMap = new Map<string, string>()
  const clonedNodes = preset.nodes.map((n) => {
    const c = deepClone(n)
    const nid = newId(c.id || 'node', used)
    idMap.set(n.id || c.id || nid, nid)
    c.id = nid
    used.add(nid)
    return c
  })
  // A temporary holder to attach/find cloned nodes by original id
  const byOrig = new Map<string, any>()
  preset.nodes.forEach((orig, i) => byOrig.set(orig.id || `i${i}`, clonedNodes[i]))

  const applyOp = (op: PresetOp) => {
    const targetId = idMap.get(op.target) || op.target
    const target = findById(next, targetId)
    const nodeToInsert = byOrig.get(op.nodeId)
    if (!target || !nodeToInsert) return
    if (op.op === 'attach') {
      if (!Array.isArray(target.node.children)) target.node.children = []
      target.node.children.push(nodeToInsert)
    } else if (op.op === 'insertAfter') {
      if (!target.parent || !Array.isArray(target.parent.children)) return
      const idx = target.parent.children.indexOf(target.node)
      if (idx >= 0) target.parent.children.splice(idx + 1, 0, nodeToInsert)
    }
  }

  for (const op of preset.ops || []) applyOp(op)

  const beforeStr = JSON.stringify(tree, null, 2)
  const afterStr = JSON.stringify(next, null, 2)
  const diffText = `--- a/tree.json\n+++ b/tree.json\n@@\n-${beforeStr}\n+${afterStr}\n`
  return { nextTree: next, diffText }
}

