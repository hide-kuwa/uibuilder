'use client'
import { useMemo } from 'react'
import { useFigmaStore } from '../../lib/figma/store'
import type { Frame, Node } from '../../lib/figma/model'

function hasChildren(n: Node): n is Frame | (Node & { children: Node[] }) {
  // @ts-expect-error runtime guard
  return Array.isArray((n as any).children)
}

function findParent(root: Node, id: string, parent: Node | null = null): Node | null {
  if (root.id === id) return parent
  if (hasChildren(root)) {
    for (const c of root.children) {
      const p = findParent(c, id, root)
      if (p) return p
    }
  }
  return null
}

export default function GuideOverlay() {
  const page = useFigmaStore((s) => s.doc.pages[0])
  const root = page.root
  const selected = useFigmaStore((s) => s.selectedNode)
  const ghost = useFigmaStore((s) => s.ghostRect)

  // ガイドはドラッグ/リサイズ時（ghostRectがある時）だけ表示
  const moving = !!ghost
  const { vLines, hLines } = useMemo(() => {
    const V = new Set<number>()
    const H = new Set<number>()
    if (!ghost || !selected) return { vLines: Array.from(V), hLines: Array.from(H) }

    const thr = 6 // px 以内なら表示
    const rect = ghost
    const left = rect.x, right = rect.x + rect.width, hCenter = rect.x + rect.width / 2
    const top = rect.y, bottom = rect.y + rect.height, vCenter = rect.y + rect.height / 2

    const addNear = (set: Set<number>, target: number, candidate: number) => {
      if (Math.abs(target - candidate) <= thr) set.add(Math.round(candidate))
    }

    // 親（root or 実親）のエッジ
    const parent = findParent(root, selected.id) as Frame | Node | null
    const parentBox = parent && hasChildren(parent) ? parent : root
    const pW = (parentBox as any).width ?? root.width
    const pH = (parentBox as any).height ?? root.height

    // parent edges & centers
    const parentV = [0, pW / 2, pW]
    const parentH = [0, pH / 2, pH]
    for (const x of parentV) { addNear(V, left, x); addNear(V, right, x); addNear(V, hCenter, x) }
    for (const y of parentH) { addNear(H, top, y); addNear(H, bottom, y); addNear(H, vCenter, y) }

    // 兄弟のエッジ
    const siblings: Node[] = parent && hasChildren(parent)
      ? parent.children.filter((n) => n.id !== selected.id)
      : (root.children as Node[]).filter((n) => n.id !== selected.id)

    for (const s of siblings) {
      const sx = (s as any).x, sy = (s as any).y, sw = (s as any).width, sh = (s as any).height
      const sLeft = sx, sRight = sx + sw, sHc = sx + sw / 2
      const sTop = sy, sBottom = sy + sh, sVc = sy + sh / 2
      ;[sLeft, sHc, sRight].forEach((x) => { addNear(V, left, x); addNear(V, right, x); addNear(V, hCenter, x) })
      ;[sTop, sVc, sBottom].forEach((y) => { addNear(H, top, y); addNear(H, bottom, y); addNear(H, vCenter, y) })
    }

    // 8px グリッドの近傍
    const grid = 8
    const nearGrid = (n: number) => Math.round(n / grid) * grid
    ;[left, right, hCenter].forEach((x) => addNear(V, x, nearGrid(x)))
    ;[top, bottom, vCenter].forEach((y) => addNear(H, y, nearGrid(y)))

    return { vLines: Array.from(V), hLines: Array.from(H) }
  }, [root, selected, ghost])

  if (!moving) return null

  return (
    <div className="pointer-events-none absolute inset-0" style={{ zIndex: 50 }}>
      {/* vertical lines */}
      {vLines.map((x) => (
        <div
          key={`v-${x}`}
          style={{
            position: 'absolute',
            left: x,
            top: 0,
            width: 1,
            height: '100%',
            background: 'rgba(236,72,153,0.9)', // pink-500
          }}
        />
      ))}
      {/* horizontal lines */}
      {hLines.map((y) => (
        <div
          key={`h-${y}`}
          style={{
            position: 'absolute',
            top: y,
            left: 0,
            height: 1,
            width: '100%',
            background: 'rgba(236,72,153,0.9)',
          }}
        />
      ))}
    </div>
  )
}

