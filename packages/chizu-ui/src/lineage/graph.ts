// packages/chizu-ui/src/lineage/graph.ts
import type { LineageGraph } from '@chizu/types/lineage'

export type Adjacency = {
  up: Record<string, string[]>
  down: Record<string, string[]>
}

export function buildAdjacency(g: LineageGraph): Adjacency {
  const up: Record<string, string[]> = {}
  const down: Record<string, string[]> = {}
  for (const id of Object.keys(g.nodes)) { up[id] = []; down[id] = [] }
  for (const e of g.edges) {
    if (!down[e.from]) down[e.from] = []
    if (!up[e.to]) up[e.to] = []
    down[e.from].push(e.to)
    up[e.to].push(e.from)
  }
  return { up, down }
}

export function walkUp(g: LineageGraph | Adjacency, start: string): string[] {
  const adj = isAdj(g) ? g : buildAdjacency(g)
  const out: string[] = []
  const seen = new Set<string>([start])
  const q = [start]
  while (q.length) {
    const cur = q.shift()!
    for (const p of adj.up[cur] || []) {
      if (seen.has(p)) continue
      seen.add(p); out.push(p); q.push(p)
    }
  }
  return out
}

export function walkDown(g: LineageGraph | Adjacency, start: string): string[] {
  const adj = isAdj(g) ? g : buildAdjacency(g)
  const out: string[] = []
  const seen = new Set<string>([start])
  const q = [start]
  while (q.length) {
    const cur = q.shift()!
    for (const n of adj.down[cur] || []) {
      if (seen.has(n)) continue
      seen.add(n); out.push(n); q.push(n)
    }
  }
  return out
}

function isAdj(x: any): x is Adjacency { return !!(x && x.up && x.down) }

// --- append-only: cycle detection ---
export function detectCycles(g: LineageGraph): string[][] {
  const down = buildAdjacency(g).down
  const visited = new Set<string>()
  const stack = new Set<string>()
  const path: string[] = []
  const cycles: string[][] = []

  function dfs(u: string) {
    visited.add(u)
    stack.add(u)
    path.push(u)
    for (const v of down[u] ?? []) {
      if (!visited.has(v)) {
        dfs(v)
      } else if (stack.has(v)) {
        const i = path.indexOf(v)
        if (i >= 0) cycles.push(path.slice(i))
      }
    }
    stack.delete(u)
    path.pop()
  }

  Object.keys(g.nodes).forEach((id) => { if (!visited.has(id)) dfs(id) })
  return cycles
}
