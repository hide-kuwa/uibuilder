// apps/builder/lib/guide/actions.ts
import type { AuditIssue } from '@/lib/audit/types'
import { ensureAAColorPair } from './color'

function deepClone<T>(x: T): T {
  try { return structuredClone(x) } catch { return JSON.parse(JSON.stringify(x)) }
}

type Node = any

function walk(node: Node, fn: (n: Node) => void) {
  if (!node) return
  fn(node)
  const children: any[] = node.children || node.props?.children || []
  if (Array.isArray(children)) {
    for (const c of children) walk(c, fn)
  } else if (children) {
    walk(children, fn)
  }
}

function locate(root: Node, nodeId: string): Node | null {
  let found: Node | null = null
  walk(root, (n) => { if (!found && (n.id === nodeId || n.nodeId === nodeId)) found = n })
  return found
}

function pickColor(node: Node, key: 'color' | 'backgroundColor'): string {
  const v = node?.props?.style?.[key]
  if (typeof v === 'string' && v) return v
  return key === 'color' ? '#111827' : '#ffffff'
}

function setColor(node: Node, key: 'color' | 'backgroundColor', val: string) {
  if (!node.props) node.props = {}
  if (!node.props.style) node.props.style = {}
  node.props.style[key] = val
}

export function applyContrastFix(tree: any, issue: AuditIssue) {
  const draft = deepClone(tree)
  const node = locate(draft, issue.nodeId)
  if (!node) return draft
  const fg = pickColor(node, 'color')
  const bg = pickColor(node, 'backgroundColor')
  const { fg: newFg, bg: newBg } = ensureAAColorPair(fg, bg)
  setColor(node, 'color', newFg)
  setColor(node, 'backgroundColor', newBg)
  return draft
}

export function applyFontVarietyFix(tree: any) {
  const draft = deepClone(tree)
  walk(draft, (n: any) => {
    const fam = n?.props?.style?.fontFamily
    if (fam && !['Inter', 'Noto Sans JP'].includes(fam)) {
      if (!n.props) n.props = {}
      if (!n.props.style) n.props.style = {}
      n.props.style.fontFamily = 'Inter'
    }
  })
  return draft
}

export function applyGrid8Fix(tree: any) {
  const draft = deepClone(tree)
  const round8 = (x: number) => Math.round(x / 8) * 8
  const keys = ['width', 'height', 'padding', 'margin', 'left', 'top', 'right', 'bottom'] as const
  walk(draft, (n: any) => {
    for (const k of keys) {
      const v = n?.props?.style?.[k as any]
      if (typeof v === 'number') {
        if (!n.props) n.props = {}
        if (!n.props.style) n.props.style = {}
        n.props.style[k as any] = round8(v as number)
      }
    }
  })
  return draft
}

export function applyAlignmentFix(tree: any, tolerance = 3) {
  const draft = deepClone(tree)
  // For each parent with array children, cluster by rounded y and snap to average per cluster
  const processSiblings = (arr: any[]) => {
    const buckets = new Map<number, any[]>()
    for (const n of arr) {
      const y = n?.frame?.y ?? n?.props?.style?.top
      if (typeof y !== 'number') continue
      const key = Math.round(y / tolerance) * tolerance
      const list = buckets.get(key) || []
      list.push(n)
      buckets.set(key, list)
    }
    for (const [, list] of buckets) {
      if (list.length < 2) continue
      const meanY = Math.round(list.reduce((a, n) => a + (n?.frame?.y ?? n?.props?.style?.top ?? 0), 0) / list.length)
      for (const n of list) {
        if (n.frame && typeof n.frame.y === 'number') n.frame.y = meanY
        else {
          if (!n.props) n.props = {}
          if (!n.props.style) n.props.style = {}
          n.props.style.top = meanY
        }
      }
    }
  }
  const visit = (n: any) => {
    const ch: any[] = Array.isArray(n?.children) ? n.children : Array.isArray(n?.props?.children) ? n.props.children : []
    if (Array.isArray(ch) && ch.length > 1) processSiblings(ch)
    for (const c of ch) visit(c)
  }
  visit(draft)
  return draft
}

export function applyA11yHeadingFix(tree: any) {
  const draft = deepClone(tree)
  let prevLevel = 1
  const getLevel = (n: any): number | null => {
    const tag = (n?.props?.as || n?.tagName || n?.type) as string | undefined
    if (!tag) return null
    const m = String(tag).toLowerCase().match(/^h([1-6])$/)
    return m ? Number(m[1]) : null
  }
  const setLevel = (n: any, L: number) => {
    if (n.props && 'as' in n.props) n.props.as = `h${L}`
    else if (n.tagName) n.tagName = `h${L}`
    else {
      if (!n.props) n.props = {}
      n.props.as = `h${L}`
    }
  }
  const walkFix = (n: any) => {
    const L = getLevel(n)
    if (L) {
      const allowed = Math.min(prevLevel + 1, 6)
      const next = L > allowed ? allowed : L
      if (next !== L) setLevel(n, next)
      prevLevel = next
    }
    const ch: any[] = Array.isArray(n?.children) ? n.children : Array.isArray(n?.props?.children) ? n.props.children : []
    for (const c of ch) walkFix(c)
  }
  walkFix(draft)
  return draft
}
