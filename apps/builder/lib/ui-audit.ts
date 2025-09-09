// apps/builder/lib/ui-audit.ts
// Shared scoring utilities for UI audit (SSR/Route compatible)

export type ComponentNode = {
  id: string
  type: string
  props?: {
    textColor?: string
    bgColor?: string
    fontSize?: string | number
  }
  style?: {
    margin?: string
    padding?: string
    left?: string | number
    top?: string | number
    width?: string | number
    height?: string | number
  }
  frame?: { x?: number | string; y?: number | string; w?: number | string; h?: number | string }
  layout?: { x?: number | string; y?: number | string; w?: number | string; h?: number | string }
  children?: ComponentNode[]
}

// --- color + number helpers ---
function parseHexColor(s: string): [number, number, number] | null {
  const m = s.trim().toLowerCase()
  if (!m.startsWith('#')) return null
  const hex = m.slice(1)
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16)
    const g = parseInt(hex[1] + hex[1], 16)
    const b = parseInt(hex[2] + hex[2], 16)
    return [r, g, b]
  }
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return [r, g, b]
  }
  return null
}

function parseRgb(s: string): [number, number, number] | null {
  const m = s.trim().match(/^rgb\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\)$/i)
  if (!m) return null
  return [Number(m[1]), Number(m[2]), Number(m[3])]
}

function relLuminance([r, g, b]: [number, number, number]): number {
  const srgb = [r, g, b].map((v) => v / 255)
  const rgb = srgb.map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))) as [number, number, number]
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
}

function contrastRatio(c1: [number, number, number], c2: [number, number, number]): number {
  const L1 = relLuminance(c1)
  const L2 = relLuminance(c2)
  const lighter = Math.max(L1, L2)
  const darker = Math.min(L1, L2)
  return (lighter + 0.05) / (darker + 0.05)
}

function parseColor(s?: string): [number, number, number] | null {
  if (!s) return null
  return parseHexColor(s) || parseRgb(s) || null
}

function toPx(fs: string | number | undefined): number | null {
  if (fs == null) return null
  if (typeof fs === 'number' && isFinite(fs)) return fs
  if (typeof fs === 'string') {
    const m = fs.trim().match(/^(\d+\.?\d*)px$/)
    if (m) return parseFloat(m[1])
  }
  return null
}

function extractPxValues(shorthand?: string): number[] {
  if (!shorthand) return []
  const tokens = shorthand.trim().split(/\s+/)
  const out: number[] = []
  for (const t of tokens) {
    const m = t.match(/^(\d+\.?\d*)px$/)
    if (m) out.push(parseFloat(m[1]))
  }
  return out
}

function toNum(v: any): number | null {
  if (v == null) return null
  if (typeof v === 'number' && isFinite(v)) return v
  if (typeof v === 'string') {
    const m = v.trim().match(/^(\d+\.?\d*)px$/)
    if (m) return parseFloat(m[1])
    const n = Number(v)
    if (!Number.isNaN(n)) return n
  }
  return null
}

function getFrame(n: ComponentNode): { id: string; x: number; y: number; w: number; h: number } | null {
  const id: string = String(n?.id ?? '')
  const cands: Array<any> = [
    n,
    (n as any)?.frame,
    (n as any)?.layout,
    (n as any)?.props?.frame,
    { x: n?.style?.left, y: n?.style?.top, width: n?.style?.width, height: n?.style?.height },
  ]
  for (const c of cands) {
    if (!c) continue
    const x = toNum(c.x)
    const y = toNum(c.y)
    const w = toNum(c.w ?? c.width)
    const h = toNum(c.h ?? c.height)
    if (x != null && y != null && w != null && h != null) return { id, x, y, h, w }
  }
  return null
}

const snap8 = (v: number) => Math.round(v / 8) * 8
const onGrid8 = (v: number, tol = 1): boolean => {
  const r = Math.abs(v % 8)
  return r <= tol || Math.abs(8 - r) <= tol
}

const isLargeText = (fs?: string | number): boolean => {
  const px = toPx(fs)
  return px !== null && px >= 18.66 // bold+14px 未対応のためサイズのみで近似
}

export type AuditScores = {
  contrast: number
  fontVariety: number
  gridSpacing: number
  alignment: number
  average: number
}

export type AuditIssues = {
  contrast: string[]
  fontVariety: string[]
  gridSpacing: string[]
  alignment: string[]
}

// append-only: rich issue details (keeps existing AuditIssues for backwards-compat)
export type ContrastIssueDetail = {
  id: string
  ratio: number | null
  required: number
  level: 'warning' | 'error'
  textColor?: string
  bgColor?: string
}

export type AuditIssuesDetail = {
  contrast: ContrastIssueDetail[]
}

export function evaluateAudit(tree: ComponentNode[]): { scores: AuditScores; issues: AuditIssues; issuesDetail: AuditIssuesDetail } {
  // collections
  let contrastTotal = 0
  let contrastPass = 0
  const contrastFailIds = new Set<string>()

  const fontSizes = new Set<number>()
  const spacingPxValues: Record<string, number[]> = {}

  const frames: Array<{ id: string; L: number; R: number; T: number; B: number }> = []
  const contrastDetails: ContrastIssueDetail[] = []

  const walk = (n: ComponentNode) => {
    // font sizes
    const px = toPx(n.props?.fontSize)
    if (px !== null) fontSizes.add(px)
    // spacing px values
    const vals = [...extractPxValues(n.style?.margin), ...extractPxValues(n.style?.padding)]
    if (vals.length) spacingPxValues[n.id] = vals
    // contrast
    const tc = parseColor(n.props?.textColor || '')
    const bg = parseColor(n.props?.bgColor || '')
    const ratio = tc && bg ? contrastRatio(tc, bg) : null
    if (ratio !== null) {
      contrastTotal++
      const req = isLargeText(n.props?.fontSize) ? 3.0 : 4.5
      if (ratio >= req) contrastPass++
      else contrastFailIds.add(n.id)
      // append-only: collect detailed entry for failed nodes
      if (ratio < req) {
        const level: 'warning' | 'error' = ratio < 3.0 ? 'error' : 'warning'
        contrastDetails.push({ id: n.id, ratio, required: req, level, textColor: n.props?.textColor, bgColor: n.props?.bgColor })
      }
    }
    // frames
    const f = getFrame(n)
    if (f) frames.push({ id: n.id, L: f.x, R: f.x + f.w, T: f.y, B: f.y + f.h })
    // children
    if (n.children) n.children.forEach(walk)
  }
  tree.forEach(walk)

  // scores
  const contrastPct = contrastTotal ? Math.round((contrastPass / contrastTotal) * 100) : 100

  const fv = fontSizes.size
  const fontScore = (() => {
    const min = 4,
      max = 10
    if (fv <= min) return 100
    if (fv >= max) return 0
    return Math.round(100 * (1 - (fv - min) / (max - min)))
  })()

  const spacingAll = Object.values(spacingPxValues).flat()
  const spacingPct = spacingAll.length ? Math.round((spacingAll.filter((v) => onGrid8(v)).length / spacingAll.length) * 100) : 100
  const spacingIssueIds = new Set<string>()
  for (const [id, vals] of Object.entries(spacingPxValues)) {
    if (vals.some((v) => !onGrid8(v))) spacingIssueIds.add(id)
  }

  // alignment via L/R buckets
  const total = frames.length
  const leftBuckets = new Map<number, string[]>()
  const rightBuckets = new Map<number, string[]>()
  for (const f of frames) {
    const Ls = snap8(f.L)
    const Rs = snap8(f.R)
    leftBuckets.set(Ls, (leftBuckets.get(Ls) || []).concat(f.id))
    rightBuckets.set(Rs, (rightBuckets.get(Rs) || []).concat(f.id))
  }
  const alignedSet = new Set<string>()
  for (const ids of leftBuckets.values()) if (ids.length >= 2) ids.forEach((id) => alignedSet.add(id))
  for (const ids of rightBuckets.values()) if (ids.length >= 2) ids.forEach((id) => alignedSet.add(id))
  const alignPct = total ? Math.round((alignedSet.size / total) * 100) : 100
  const misalignedIds = frames.map((f) => f.id).filter((id) => !alignedSet.has(id))

  const scores: AuditScores = {
    contrast: contrastPct,
    fontVariety: fontScore,
    gridSpacing: spacingPct,
    alignment: alignPct,
    average: Math.round((contrastPct + fontScore + spacingPct + alignPct) / 4),
  }
  const issues: AuditIssues = {
    contrast: Array.from(contrastFailIds),
    fontVariety: [],
    gridSpacing: Array.from(spacingIssueIds),
    alignment: misalignedIds,
  }
  const issuesDetail: AuditIssuesDetail = { contrast: contrastDetails }
  return { scores, issues, issuesDetail }
}
