/**
 * v13-2: ヒットテスト（BVH 経由）
 *
 * - エディタツリーから AABB と zOrder を抽出して BVH を構築
 * - ポイントヒット / 矩形選択（重なり）API を提供
 * - 既存の呼び出し側からは updateHitIndex(tree), pickAt, queryRect を使用
 *
 * ※ 変形（回転/スケール）は MVP では未対応。AABB は left/top/width/height を基準に算出。
 */
import { buildBVH, hitTestPoint, queryOverlap, type AABB, type BVHNode, type Item } from '@/lib/hittest/bvh'

let _root: BVHNode | null = null
let _idToItem = new Map<string, Item>()
let _version = 0

export function updateHitIndex(tree: any[]) {
  _idToItem.clear()
  const items: Item[] = []
  let z = 0
  traverse(tree, (n: any) => {
    const id = String(n?.id ?? '')
    if (!id) return
    const vis = isVisible(n)
    const box = aabbOf(n)
    if (!box) return
    // z は描画順（後に来る = 前面）
    items.push({ id, box, zOrder: z++, visible: vis })
  })
  _root = buildBVH(items)
  for (const it of items) _idToItem.set(it.id, it)
  _version++
}

/** クリック等のヒットテスト（前面の1件の id を返す） */
export function pickAt(x: number, y: number): string | null {
  if (!_root) return null
  const it = hitTestPoint(_root, x, y)
  return it?.id ?? null
}

/** 矩形選択（重なった id を zOrder 降順で返す） */
export function queryRect(x: number, y: number, w: number, h: number): string[] {
  if (!_root) return []
  const r: AABB = {
    minX: Math.min(x, x + w),
    minY: Math.min(y, y + h),
    maxX: Math.max(x, x + w),
    maxY: Math.max(y, y + h),
  }
  const items = queryOverlap(_root, r)
  return items.map((it) => it.id)
}

export function currentHitIndexVersion() {
  return _version
}

// ===== Helpers =====
function aabbOf(n: any): AABB | null {
  const s = n?.style ?? {}
  const p = n?.props ?? {}
  const x = pickNum(s.left, p.x, 0)
  const y = pickNum(s.top, p.y, 0)
  const w = pickNum(s.width, p.w, 0)
  const h = pickNum(s.height, p.h, 0)
  if (!(isFiniteNum(x) && isFiniteNum(y) && isFiniteNum(w) && isFiniteNum(h))) return null
  return { minX: x, minY: y, maxX: x + w, maxY: y + h }
}
function isVisible(n: any): boolean {
  const s = n?.style ?? {}
  const p = n?.props ?? {}
  if (p.visible === false) return false
  if (s.display === 'none') return false
  if (Number(s.opacity) === 0 || Number(p.opacity) === 0) return false
  return true
}
function traverse(nodes: any[], fn: (n: any) => void) {
  for (const n of nodes ?? []) {
    fn(n)
    const ch = n?.children
    if (ch && Array.isArray(ch)) traverse(ch, fn)
  }
}
function pickNum(...vals: any[]): number {
  for (const v of vals) {
    const n = Number(v)
    if (!Number.isNaN(n)) return n
  }
  return 0
}
function isFiniteNum(v: any): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}
