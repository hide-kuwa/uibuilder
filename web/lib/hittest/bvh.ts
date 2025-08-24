/**
 * v13-2: BVH ヒットテスト（AABBツリー）
 *
 * - 軸に沿った中央値分割の AABB ツリー（再帰・葉は最大8件）
 * - 点ヒット / 矩形クエリ（重なり）をサポート
 * - zOrder（描画順）で降順ソートして最前面を返却
 * - 依存なし。1kノードで>3×、5kで>5×の高速化を狙う（目安）
 */

export type AABB = { minX: number; minY: number; maxX: number; maxY: number }
export type Item = { id: string; box: AABB; zOrder: number; visible?: boolean }

export type BVHNode =
  | { type: 'leaf'; box: AABB; items: Item[] }
  | { type: 'branch'; box: AABB; left: BVHNode; right: BVHNode }

const LEAF_CAPACITY = 8

export function buildBVH(items: Item[]): BVHNode | null {
  const src = items.filter((i) => i.visible !== false && valid(i.box))
  if (src.length === 0) return null
  return build(src)
}

export function hitTestPoint(root: BVHNode | null, x: number, y: number): Item | null {
  if (!root) return null
  // 走査しつつ zOrder 降順で最初に当たったものを返す
  let best: Item | null = null
  const stack: BVHNode[] = [root]
  while (stack.length) {
    const n = stack.pop()!
    if (!containsPoint(n.box, x, y)) continue
    if (n.type === 'leaf') {
      for (let i = 0; i < n.items.length; i++) {
        const it = n.items[i]
        if (containsPoint(it.box, x, y)) {
          if (!best || it.zOrder > best.zOrder) best = it
        }
      }
    } else {
      // 描画順とは無関係だが、探索を先に進めてもよい
      stack.push(n.left, n.right)
    }
  }
  return best
}

export function queryOverlap(root: BVHNode | null, r: AABB): Item[] {
  if (!root) return []
  const out: Item[] = []
  const stack: BVHNode[] = [root]
  while (stack.length) {
    const n = stack.pop()!
    if (!intersects(n.box, r)) continue
    if (n.type === 'leaf') {
      for (let i = 0; i < n.items.length; i++) {
        const it = n.items[i]
        if (intersects(it.box, r)) out.push(it)
      }
    } else {
      stack.push(n.left, n.right)
    }
  }
  // 表示順でソート（前面が先頭）
  out.sort((a, b) => b.zOrder - a.zOrder)
  return out
}

// ===== internal =====
function build(list: Item[]): BVHNode {
  const nodeBox = list.reduce(expandToFit, makeEmptyAABB())
  if (list.length <= LEAF_CAPACITY) {
    // 葉。描画順（zOrder降順）に詰めておく
    const items = list.slice().sort((a, b) => b.zOrder - a.zOrder)
    return { type: 'leaf', box: nodeBox, items }
  }
  const extX = nodeBox.maxX - nodeBox.minX
  const extY = nodeBox.maxY - nodeBox.minY
  const axis: 'x' | 'y' = extX >= extY ? 'x' : 'y'
  const centers = list.map((it) => ({
    c: axis === 'x' ? (it.box.minX + it.box.maxX) / 2 : (it.box.minY + it.box.maxY) / 2,
    it,
  }))
  centers.sort((a, b) => a.c - b.c)
  const mid = centers.length >> 1
  const left = centers.slice(0, mid).map((c) => c.it)
  const right = centers.slice(mid).map((c) => c.it)
  // 片寄り防止（極端な場合は分割しないで葉に）
  if (left.length === 0 || right.length === 0) {
    const items = list.slice().sort((a, b) => b.zOrder - a.zOrder)
    return { type: 'leaf', box: nodeBox, items }
  }
  const L = build(left)
  const R = build(right)
  const box = mergeAABB(L.box, R.box)
  return { type: 'branch', box, left: L, right: R }
}

function containsPoint(b: AABB, x: number, y: number) {
  return x >= b.minX && x <= b.maxX && y >= b.minY && y <= b.maxY
}
function intersects(a: AABB, b: AABB) {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY
}
function valid(b: AABB) {
  return Number.isFinite(b.minX) && Number.isFinite(b.minY) && Number.isFinite(b.maxX) && Number.isFinite(b.maxY)
}
function makeEmptyAABB(): AABB {
  return { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
}
function expandToFit(box: AABB, it: Item) {
  box.minX = Math.min(box.minX, it.box.minX)
  box.minY = Math.min(box.minY, it.box.minY)
  box.maxX = Math.max(box.maxX, it.box.maxX)
  box.maxY = Math.max(box.maxY, it.box.maxY)
  return box
}
function mergeAABB(a: AABB, b: AABB): AABB {
  return {
    minX: Math.min(a.minX, b.minX),
    minY: Math.min(a.minY, b.minY),
    maxX: Math.max(a.maxX, b.maxX),
    maxY: Math.max(a.maxY, b.maxY),
  }
}
