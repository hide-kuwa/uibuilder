// apps/builder/app/dev/ui-audit/page.tsx
// SSR page: UI design audit (initial skeleton)
import React from 'react'

// --- Types (temporary, append-only) ---
type ComponentNode = {
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
  }
  children?: ComponentNode[]
}

// --- Mock data (replaceable with real builder store later) ---
function loadMockNodes(): ComponentNode[] {
  return [
    {
      id: 'hero-title',
      type: 'Text',
      props: { textColor: '#111827', bgColor: '#ffffff', fontSize: 32 },
      style: { margin: '16px 0', padding: '8px' },
    },
    {
      id: 'subcopy',
      type: 'Text',
      props: { textColor: '#6b7280', bgColor: '#ffffff', fontSize: 14 },
      style: { margin: '10px 0', padding: '7px 9px' },
    },
    {
      id: 'cta',
      type: 'Button',
      props: { textColor: '#ffffff', bgColor: '#2563eb', fontSize: '16px' },
      style: { margin: '24px 0 12px', padding: '12px 20px' },
    },
    {
      id: 'footer',
      type: 'Text',
      props: { textColor: '#9ca3af', bgColor: '#111827', fontSize: 12 },
      style: { margin: '12px', padding: '12px' },
    },
  ]
}

// --- Helpers: color parsing and WCAG contrast ---
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
  const srgb = [r, g, b].map(v => v / 255)
  const rgb = srgb.map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))) as [number, number, number]
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

// --- Helpers: extract numeric px values from shorthand ---
function extractPxValues(shorthand?: string): number[] {
  if (!shorthand) return []
  // split on whitespace, handle up to 4 values; only take px numbers
  const tokens = shorthand.trim().split(/\s+/)
  const out: number[] = []
  for (const t of tokens) {
    const m = t.match(/^(\d+\.?\d*)px$/)
    if (m) out.push(parseFloat(m[1]))
  }
  return out
}

function walk(nodes: ComponentNode[], fn: (n: ComponentNode) => void) {
  const stack: ComponentNode[] = [...nodes]
  while (stack.length) {
    const n = stack.shift()!
    fn(n)
    if (n.children && n.children.length) stack.unshift(...n.children)
  }
}

export default async function Page() {
  const nodes = loadMockNodes()

  // Metrics containers
  const fontSizes = new Set<number>()
  const spacingValues: number[] = []
  type ContrastRow = { id: string; type: string; ratio: number | null; text?: string; bg?: string }
  const contrastRows: ContrastRow[] = []

  walk(nodes, (n) => {
    // font-size
    const fs = n.props?.fontSize
    if (typeof fs === 'number' && isFinite(fs)) fontSizes.add(fs)
    if (typeof fs === 'string') {
      const m = fs.trim().match(/^(\d+\.?\d*)px$/)
      if (m) fontSizes.add(parseFloat(m[1]))
    }
    // spacing
    extractPxValues(n.style?.margin).forEach((v) => spacingValues.push(v))
    extractPxValues(n.style?.padding).forEach((v) => spacingValues.push(v))
    // contrast
    const tc = parseColor(n.props?.textColor || '')
    const bg = parseColor(n.props?.bgColor || '')
    const ratio = tc && bg ? contrastRatio(tc, bg) : null
    contrastRows.push({ id: n.id, type: n.type, ratio, text: n.props?.textColor, bg: n.props?.bgColor })
  })

  // Compute 8px grid adherence
  const onGridCount = spacingValues.filter((v) => Math.abs(v % 8) < 0.01).length
  const spacingRate = spacingValues.length ? Math.round((onGridCount / spacingValues.length) * 100) : 100

  // Contrast evaluation (AA normal text threshold 4.5)
  const contrastFails = contrastRows.filter((r) => r.ratio !== null && (r.ratio as number) < 4.5)

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-lg font-semibold">UI Audit (prototype)</h1>
      <p className="text-sm text-gray-600">SSR mock metrics. Will be wired to builder store later.</p>

      <section className="space-y-2">
        <h2 className="font-semibold">Summary</h2>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="border rounded p-2">
            <div className="text-xs opacity-70">font-size 種類数</div>
            <div className="text-xl font-semibold">{fontSizes.size}</div>
            <div className="text-xs text-gray-600">[{Array.from(fontSizes).sort((a,b)=>a-b).join(', ')}]</div>
          </div>
          <div className="border rounded p-2">
            <div className="text-xs opacity-70">8pxグリッド適合率 (margin/padding)</div>
            <div className="text-xl font-semibold">{spacingRate}%</div>
            <div className="text-xs text-gray-600">総数 {spacingValues.length} / on-grid {onGridCount}</div>
          </div>
          <div className="border rounded p-2">
            <div className="text-xs opacity-70">コントラスト不適合 (AA 4.5未満)</div>
            <div className="text-xl font-semibold">{contrastFails.length}</div>
            <div className="text-xs text-gray-600">対象 {contrastRows.filter(r=>r.ratio!==null).length} ノード</div>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Contrast details</h2>
        <div className="space-y-1 text-xs">
          {contrastRows.map((r) => {
            const fail = r.ratio !== null && r.ratio < 4.5
            return (
              <div key={r.id} className={`border rounded p-2 ${fail ? 'border-rose-300 bg-rose-50' : 'border-gray-200'}`}>
                <div className="font-mono text-[11px]">{r.id} <span className="opacity-60">({r.type})</span></div>
                <div>ratio: <b>{r.ratio ? r.ratio.toFixed(2) : '-'}</b> <span className="opacity-70">(text {r.text || '-'} on {r.bg || '-'})</span></div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Notes</h2>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>閾値: AA 通常テキスト 4.5。大きなテキストの場合は 3.0 を許容（後続で判定に font-size を反映予定）。</li>
          <li>8px グリッドは margin/padding の px 値のみ評価。% / rem などは今後対応。</li>
          <li>実データ連携後は、ノード選択と連動したハイライトやジャンプも提供予定。</li>
        </ul>
      </section>
    </main>
  )
}

// --- append-only: Load real ComponentNode[] from public/pages (client augment) ---
;(() => {
  if (typeof window === 'undefined') return

  type Node = ComponentNode

  const byId = (id: string) => document.getElementById(id)

  const getSlug = () => new URLSearchParams(window.location.search).get('slug') || 'sample'

  const renderRealMetrics = (nodes: Node[], sourceHint: string) => {
    // Collect metrics using existing helpers (walk, extractPxValues, parseColor, contrastRatio)
    const fontSizes = new Set<number>()
    const spacingValues: number[] = []
    type ContrastRow = { id: string; type: string; ratio: number | null; text?: string; bg?: string }
    const contrastRows: ContrastRow[] = []

    walk(nodes, (n) => {
      const fs = n.props?.fontSize
      if (typeof fs === 'number' && isFinite(fs)) fontSizes.add(fs)
      if (typeof fs === 'string') {
        const m = fs.trim().match(/^(\d+\.?\d*)px$/)
        if (m) fontSizes.add(parseFloat(m[1]))
      }
      extractPxValues(n.style?.margin).forEach((v) => spacingValues.push(v))
      extractPxValues(n.style?.padding).forEach((v) => spacingValues.push(v))
      const tc = parseColor(n.props?.textColor || '')
      const bg = parseColor(n.props?.bgColor || '')
      const ratio = tc && bg ? contrastRatio(tc, bg) : null
      contrastRows.push({ id: n.id, type: n.type, ratio, text: n.props?.textColor, bg: n.props?.bgColor })
    })

    const onGridCount = spacingValues.filter((v) => Math.abs(v % 8) < 0.01).length
    const spacingRate = spacingValues.length ? Math.round((onGridCount / spacingValues.length) * 100) : 100
    const contrastFails = contrastRows.filter((r) => r.ratio !== null && (r.ratio as number) < 4.5)

    // Inject a new block under the H1
    const main = document.querySelector('main') || document.body
    if (!main || (main as any).__realAuditInjected) return
    const h1 = main.querySelector('h1')
    const wrap = document.createElement('section')
    wrap.setAttribute('data-ui-audit-real', '1')
    wrap.className = 'space-y-4 border rounded p-3'
    wrap.innerHTML = `
      <div class="text-sm text-gray-700">
        Using real data from <code class="font-mono">${sourceHint}</code>. Add ?slug=your-slug to switch.
      </div>
      <div class="grid grid-cols-3 gap-3 text-sm">
        <div class="border rounded p-2">
          <div class="text-xs opacity-70">font-size 種類数</div>
          <div class="text-xl font-semibold">${fontSizes.size}</div>
          <div class="text-xs text-gray-600">[${Array.from(fontSizes).sort((a:any,b:any)=>a-b).join(', ')}]</div>
        </div>
        <div class="border rounded p-2">
          <div class="text-xs opacity-70">8pxグリッド適合率 (margin/padding)</div>
          <div class="text-xl font-semibold">${spacingRate}%</div>
          <div class="text-xs text-gray-600">総数 ${spacingValues.length} / on-grid ${onGridCount}</div>
        </div>
        <div class="border rounded p-2">
          <div class="text-xs opacity-70">コントラスト不適合 (AA 4.5未満)</div>
          <div class="text-xl font-semibold">${contrastFails.length}</div>
          <div class="text-xs text-gray-600">対象 ${contrastRows.filter(r=>r.ratio!==null).length} ノード</div>
        </div>
      </div>
      <div class="space-y-1 text-xs" data-ui-audit-real-contrast></div>
    `
    if (h1?.parentElement) h1.parentElement.insertBefore(wrap, h1.nextSibling)
    else main.insertBefore(wrap, main.firstChild)

    const details = wrap.querySelector('[data-ui-audit-real-contrast]') as HTMLElement
    for (const r of contrastRows) {
      const fail = r.ratio !== null && (r.ratio as number) < 4.5
      const row = document.createElement('div')
      row.className = `border rounded p-2 ${fail ? 'border-rose-300 bg-rose-50' : 'border-gray-200'}`
      row.innerHTML = `
        <div class="font-mono text-[11px]">${r.id} <span class="opacity-60">(${r.type})</span></div>
        <div>ratio: <b>${r.ratio ? (r.ratio as number).toFixed(2) : '-'}</b> <span class="opacity-70">(text ${r.text || '-'} on ${r.bg || '-'})</span></div>
      `
      details.appendChild(row)
    }
    ;(main as any).__realAuditInjected = true
  }

  const load = async () => {
    const slug = getSlug()
    const url = `/pages/${encodeURIComponent(slug)}.json`
    try {
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) throw new Error(String(res.status))
      const data = await res.json()
      const nodes = Array.isArray(data?.tree) ? (data.tree as Node[]) : (Array.isArray(data) ? (data as Node[]) : null)
      if (!nodes) throw new Error('invalid tree')
      renderRealMetrics(nodes, url)
    } catch (err) {
      // show a gentle hint only
      const main = document.querySelector('main') || document.body
      if (!main || (main as any).__realAuditInjected) return
      const h1 = main.querySelector('h1')
      const p = document.createElement('p')
      p.className = 'text-xs text-gray-500'
      p.textContent = 'No real data found under /public/pages (expected sample.json with { tree: ComponentNode[] }).'
      if (h1?.parentElement) h1.parentElement.insertBefore(p, h1.nextSibling)
      else main.insertBefore(p, main.firstChild)
      ;(main as any).__realAuditInjected = true
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load, { once: true })
  } else {
    load()
  }
})()

// --- append-only: E-30 Heatmap sort toggle by issue counts (contrast/spacing/alignment) ---
;(() => {
  if (typeof window === 'undefined') return

  type ScoreResp = { issues?: { contrast?: string[]; gridSpacing?: string[]; alignment?: string[] } }

  const getHeatmapGrid = () => {
    const section = document.querySelector('[data-ui-audit-global]') as HTMLElement | null
    if (!section) return { section: null as HTMLElement | null, grid: null as HTMLElement | null }
    // grid directly under the section (created in E-26)
    const grid = section.querySelector('div.grid.grid-cols-2, div.grid-cols-2, div.grid') as HTMLElement | null
    return { section, grid }
  }

  const getCards = (grid: HTMLElement | null): HTMLAnchorElement[] => {
    if (!grid) return []
    const cards = Array.from(grid.querySelectorAll('a[href^="/dev/pages?tag="]')) as HTMLAnchorElement[]
    return cards
  }

  const parseSlug = (a: HTMLAnchorElement) => {
    // prefer dataset from E-29
    const ds = (a as any).dataset?.slug as string | undefined
    if (ds) return ds
    try {
      const u = new URL(a.href, window.location.origin)
      const tag = u.searchParams.get('tag')
      if (tag) return tag
    } catch {}
    const txt = (a.querySelector('.font-mono')?.textContent || '').trim()
    return txt || null
  }

  const fetchIssues = async (slug: string): Promise<ScoreResp | null> => {
    try {
      const res = await fetch(`/api/ui-audit/score?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
      if (!res.ok) return null
      return (await res.json()) as ScoreResp
    } catch { return null }
  }

  const ensureIssueCounts = async (cards: HTMLAnchorElement[]) => {
    const cache = new Map<string, ScoreResp | null>()
    for (let i = 0; i < cards.length; i++) {
      const a = cards[i]
      a.classList.add('ui-audit-card')
      if (!(a as any).dataset.index) (a as any).dataset.index = String(i)
      const slug = parseSlug(a)
      if (!slug) continue
      if (!(a as any).dataset.slug) (a as any).dataset.slug = slug
      const already = (a as any).dataset.contrastIssues
      if (already != null) continue
      let data = cache.get(slug) ?? null
      if (!cache.has(slug)) {
        data = await fetchIssues(slug)
        cache.set(slug, data)
      }
      const c = data?.issues?.contrast?.length ?? 0
      const s = data?.issues?.gridSpacing?.length ?? 0
      const al = data?.issues?.alignment?.length ?? 0
      ;(a as any).dataset.contrastIssues = String(c)
      ;(a as any).dataset.spacingIssues = String(s)
      ;(a as any).dataset.alignmentIssues = String(al)
    }
  }

  const injectSortSelect = (grid: HTMLElement) => {
    const already = (grid.parentElement as any)?.__sortInjected
    if (already) return
    const controls = document.createElement('div')
    controls.className = 'mb-2 flex items-center gap-2'
    const label = document.createElement('label')
    label.className = 'text-sm'
    label.textContent = 'Sort by: '
    const sel = document.createElement('select')
    sel.className = 'border rounded px-2 py-1 text-sm'
    ;[
      { v: 'none', t: '—' },
      { v: 'contrast', t: 'contrast (desc)' },
      { v: 'spacing', t: 'spacing (desc)' },
      { v: 'alignment', t: 'alignment (desc)' },
    ].forEach(({ v, t }) => {
      const o = document.createElement('option'); o.value = v; o.textContent = t; sel.appendChild(o)
    })
    controls.appendChild(label)
    controls.appendChild(sel)
    grid.parentElement?.insertBefore(controls, grid)
    ;(grid.parentElement as any).__sortInjected = true

    sel.addEventListener('change', () => {
      const mode = sel.value as 'none' | 'contrast' | 'spacing' | 'alignment'
      const cards = getCards(grid)
      if (mode === 'none') {
        const arr = cards.slice().sort((a, b) => Number((a as any).dataset.index ?? 0) - Number((b as any).dataset.index ?? 0))
        arr.forEach((el) => grid.appendChild(el))
        return
      }
      const key = mode === 'contrast' ? 'contrastIssues' : mode === 'spacing' ? 'spacingIssues' : 'alignmentIssues'
      const arr = cards.slice().sort((a, b) => Number((b as any).dataset[key] ?? -1) - Number((a as any).dataset[key] ?? -1))
      arr.forEach((el) => grid.appendChild(el))
    })
  }

  const init = async () => {
    const { section, grid } = getHeatmapGrid()
    if (!section || !grid) return
    const cards = getCards(grid)
    if (cards.length === 0) return
    await ensureIssueCounts(cards)
    injectSortSelect(grid)
  }

  const ready = () => { void init() }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true })
  else ready()
})()

// --- append-only: E-26 filters for heatmap cards (slug/title, reactive) ---
;(() => {
  if (typeof window === 'undefined') return

  const ready = () => {
    const section = document.querySelector('[data-ui-audit-global]') as HTMLElement | null
    if (!section || (section as any).__heatmapFilterInjected) return
    // find card grid by locating anchors to /dev/pages?tag=
    const cards = Array.from(section.querySelectorAll('a[href^="/dev/pages?tag="]')) as HTMLAnchorElement[]
    if (cards.length === 0) return
    const grid = cards[0].parentElement as HTMLElement | null
    if (!grid) return
    // annotate cards with class and dataset
    for (const a of cards) {
      a.classList.add('ui-audit-card')
      const slug = (a.querySelector('.font-mono')?.textContent || '').trim()
      const title = (a.querySelector('.truncate')?.textContent || '').trim()
      a.dataset.slug = slug
      a.dataset.title = title
    }
    // build controls
    const controls = document.createElement('div')
    controls.className = 'mb-2 flex items-center gap-2'
    const inSlug = document.createElement('input')
    inSlug.type = 'text'
    inSlug.placeholder = 'Filter by slug'
    inSlug.className = 'border rounded px-2 py-1 text-sm'
    const inTitle = document.createElement('input')
    inTitle.type = 'text'
    inTitle.placeholder = 'Filter by title'
    inTitle.className = 'border rounded px-2 py-1 text-sm'
    controls.appendChild(inSlug)
    controls.appendChild(inTitle)
    // insert above grid
    grid.parentElement?.insertBefore(controls, grid)

    const apply = () => {
      const s = inSlug.value.trim().toLowerCase()
      const t = inTitle.value.trim().toLowerCase()
      const cardsNow = Array.from(section.querySelectorAll('a.ui-audit-card')) as HTMLAnchorElement[]
      for (const a of cardsNow) {
        const slug = (a.dataset.slug || '').toLowerCase()
        const title = (a.dataset.title || '').toLowerCase()
        const okSlug = !s || slug.includes(s)
        const okTitle = !t || title.includes(t)
        a.style.display = okSlug && okTitle ? '' : 'none'
      }
    }
    inSlug.addEventListener('input', apply)
    inTitle.addEventListener('input', apply)
    ;(section as any).__heatmapFilterInjected = true
  }

  const init = () => {
    const mo = new MutationObserver(() => ready())
    mo.observe(document.documentElement, { childList: true, subtree: true })
    ready()
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true })
  else init()
})()

// --- append-only: E-26 Global score distribution and heatmap (/dev/ui-audit) ---
;(() => {
  if (typeof window === 'undefined') return

  type ScoreResp = { scores?: { average?: number }, slug?: string }

  const colorForScore = (s: number) => (s >= 80 ? 'text-green-700' : s >= 50 ? 'text-amber-700' : 'text-rose-700')
  const bgForScore = (s: number) => (s >= 80 ? 'bg-green-50 border-green-300' : s >= 50 ? 'bg-amber-50 border-amber-300' : 'bg-rose-50 border-rose-300')

  const fetchPagesHTML = async (): Promise<Document | null> => {
    try {
      const res = await fetch('/dev/pages', { cache: 'no-store' })
      if (!res.ok) return null
      const html = await res.text()
      const doc = new DOMParser().parseFromString(html, 'text/html')
      return doc
    } catch { return null }
  }

  const extractRows = (doc: Document): Array<{ slug: string; title: string }> => {
    const listRoot = doc.querySelector('main') || doc
    const rows = Array.from(listRoot.querySelectorAll('div.grid')) as HTMLElement[]
    const out: Array<{ slug: string; title: string }> = []
    for (const row of rows) {
      const slug = (row.children.item(0)?.textContent || '').trim()
      const title = (row.children.item(1)?.textContent || '').trim()
      if (slug) out.push({ slug, title })
    }
    return out
  }

  const fetchScore = async (slug: string): Promise<number | null> => {
    try {
      const res = await fetch(`/api/ui-audit/score?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
      if (!res.ok) return null
      const j = (await res.json()) as ScoreResp
      return typeof j?.scores?.average === 'number' ? j.scores.average : null
    } catch { return null }
  }

  const render = (items: Array<{ slug: string; title: string; score: number | null }>) => {
    const main = document.querySelector('main') || document.body
    const h1 = main.querySelector('h1')
    if (!main || !h1) return
    if ((main as any).__globalAuditInjected) return

    const container = document.createElement('section')
    container.setAttribute('data-ui-audit-global', '1')
    container.className = 'border rounded p-3 space-y-3'

    const scores = items.map(i => (typeof i.score === 'number' ? i.score : null)).filter((v): v is number => v != null)
    // Build histogram 0-10,10-20,..,90-100
    const bins = new Array(10).fill(0) as number[]
    for (const s of scores) {
      const idx = Math.min(9, Math.max(0, Math.floor(s / 10)))
      bins[idx]++
    }
    const maxBin = Math.max(1, ...bins)

    const histBars = bins.map((c, i) => {
      const from = i * 10
      const to = i === 9 ? 100 : (i + 1) * 10
      const w = Math.round((c / maxBin) * 100)
      return `<div class="flex items-center gap-2 text-xs">
        <div class="w-24 text-right">${from}-${to}</div>
        <div class="flex-1 border rounded h-3 bg-gray-50">
          <div class="h-3 bg-blue-300" style="width:${w}%;"></div>
        </div>
        <div class="w-8 text-right font-mono">${c}</div>
      </div>`
    }).join('')

    const heatCards = items.map(({ slug, title, score }) => {
      const label = typeof score === 'number' ? String(Math.round(score)) : '—'
      const cls = typeof score === 'number' ? bgForScore(score) : 'bg-gray-50 border-gray-200'
      return `<a href="/dev/pages?tag=${encodeURIComponent(slug)}" class="border rounded p-2 ${cls} block">
        <div class="text-xs font-mono">${slug}</div>
        <div class="text-xs truncate">${title || '-'}</div>
        <div class="mt-1 text-sm">Score: <b class="${typeof score==='number' ? colorForScore(score) : ''}">${label}</b></div>
      </a>`
    }).join('')

    const worst = items
      .filter(i => typeof i.score === 'number')
      .sort((a, b) => (a.score as number) - (b.score as number))
      .slice(0, 5)
      .map(({ slug, score }) => `<div class="flex items-center justify-between text-sm">
        <a class="underline text-blue-600 hover:text-blue-800" href="/audit?hash=&slug=${encodeURIComponent(slug)}">${slug}</a>
        <span class="font-mono ${colorForScore(score as number)}">${Math.round(score as number)}</span>
      </div>`)
      .join('')

    container.innerHTML = `
      <div class="font-semibold">Global UI-Audit Overview</div>
      <div class="grid grid-cols-2 gap-3">
        <div class="border rounded p-2">
          <div class="text-xs opacity-70">Score distribution (10-pt bins)</div>
          <div class="mt-2 space-y-1">${histBars}</div>
        </div>
        <div class="border rounded p-2">
          <div class="text-xs opacity-70">Worst pages (low average)</div>
          <div class="mt-2 space-y-1">${worst || '<div class="text-xs text-gray-500">n/a</div>'}</div>
        </div>
      </div>
      <div>
        <div class="text-xs opacity-70 mb-1">All pages heatmap</div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">${heatCards || '<div class="text-xs text-gray-500">No pages found</div>'}</div>
      </div>
    `

    if (h1.parentElement) h1.parentElement.insertBefore(container, h1.nextSibling)
    ;(main as any).__globalAuditInjected = true
  }

  const init = async () => {
    try {
      const doc = await fetchPagesHTML()
      if (!doc) return
      let rows = extractRows(doc)
      if (rows.length === 0) {
        render([])
        return
      }
      // Limit to 100 for performance
      rows = rows.slice(0, 100)
      const items: Array<{ slug: string; title: string; score: number | null }> = []
      await Promise.all(rows.map(async (r) => {
        const s = await fetchScore(r.slug)
        items.push({ slug: r.slug, title: r.title, score: s })
      }))
      render(items)
    } catch {
      // fail silently
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { void init() }, { once: true })
  else void init()
})()

// --- append-only: A-17 Add improvement suggestions for contrast issues ---
;(() => {
  if (typeof window === 'undefined') return

  type ContrastDetail = { id: string; ratio: number | null; required: number; level: 'warning' | 'error'; textColor?: string; bgColor?: string }
  type Resp = { slug: string; issuesDetail?: { contrast?: ContrastDetail[] } }

  const adviceFor = (d: ContrastDetail) => {
    if (d.level === 'error') return '文字と背景のコントラスト比が低すぎます。テキスト色または背景色を調整してください。'
    // warning
    return `この文字サイズでは、コントラスト比 ${d.required.toFixed(1)} 以上が推奨されます。`
  }

  const apply = (data: Resp) => {
    const details = data.issuesDetail?.contrast || []
    if (!details || details.length === 0) return
    const map = new Map<string, ContrastDetail>()
    for (const d of details) {
      const prev = map.get(d.id)
      if (!prev || (prev.level !== 'error' && d.level === 'error')) map.set(d.id, d)
    }
    const root = document.querySelector('[data-ui-audit-api]') || document
    const sections = Array.from(root.querySelectorAll('h3')) as HTMLHeadingElement[]
    const contrastH = sections.find((h) => (h.textContent || '').trim().toLowerCase() === 'issues: contrast')
    const ul = contrastH ? (contrastH.parentElement?.querySelector('ul') as HTMLUListElement | null) : null
    if (!ul) return
    const items = Array.from(ul.querySelectorAll('li')) as HTMLLIElement[]
    for (const li of items) {
      const btn = li.querySelector('button[data-jump]') as HTMLButtonElement | null
      const id = btn?.getAttribute('data-jump') || ''
      if (!id) continue
      const d = map.get(id)
      if (!d) continue
      if (li.querySelector('[data-issue-advice]')) continue
      const tip = document.createElement('div')
      tip.setAttribute('data-issue-advice', '1')
      tip.className = 'mt-1 text-xs text-gray-600 italic'
      tip.textContent = adviceFor(d)
      li.appendChild(tip)
    }
  }

  const init = async () => {
    try {
      const params = new URLSearchParams(window.location.search)
      const slug = params.get('slug') || 'sample'
      const res = await fetch(`/api/ui-audit/score?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
      if (!res.ok) return
      const json = (await res.json()) as Resp
      apply(json)
    } catch {}
  }

  const waitApiBlock = () => {
    const obs = new MutationObserver(() => {
      const api = document.querySelector('[data-ui-audit-api]')
      if (api) { obs.disconnect(); void init() }
    })
    obs.observe(document.documentElement, { childList: true, subtree: true })
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', waitApiBlock, { once: true })
  else waitApiBlock()
})()

// --- append-only: A-16 Colorize Contrast issues based on level (warning/error) ---
;(() => {
  if (typeof window === 'undefined') return

  type ContrastDetail = { id: string; ratio: number | null; required: number; level: 'warning' | 'error'; textColor?: string; bgColor?: string }
  type Resp = { slug: string; issuesDetail?: { contrast?: ContrastDetail[] } }

  const apply = (data: Resp) => {
    const details = data.issuesDetail?.contrast || []
    if (!details || details.length === 0) return
    const byId = new Map<string, ContrastDetail>()
    // prefer highest severity if duplicated
    for (const d of details) {
      const prev = byId.get(d.id)
      if (!prev) byId.set(d.id, d)
      else if (prev.level !== 'error' && d.level === 'error') byId.set(d.id, d)
    }
    const root = document.querySelector('[data-ui-audit-api]') || document
    // find the contrast list
    const sections = Array.from(root.querySelectorAll('h3')) as HTMLHeadingElement[]
    const contrastH = sections.find((h) => (h.textContent || '').trim().toLowerCase() === 'issues: contrast')
    const ul = contrastH ? (contrastH.parentElement?.querySelector('ul') as HTMLUListElement | null) : null
    if (!ul) return
    const items = Array.from(ul.querySelectorAll('li')) as HTMLLIElement[]
    for (const li of items) {
      const btn = li.querySelector('button[data-jump]') as HTMLButtonElement | null
      const id = btn?.getAttribute('data-jump') || ''
      if (!id) continue
      const d = byId.get(id)
      if (!d) continue
      li.classList.add('border', 'rounded', 'p-1')
      if (d.level === 'error') {
        li.classList.add('bg-rose-50', 'border-rose-300')
      } else if (d.level === 'warning') {
        li.classList.add('bg-amber-50', 'border-amber-300')
      }
      // optional: tooltip with details
      li.title = `contrast ${d.ratio?.toFixed?.(2) ?? '-'} (required ${d.required.toFixed(1)})`
    }
  }

  const init = async () => {
    try {
      const params = new URLSearchParams(window.location.search)
      const slug = params.get('slug') || 'sample'
      const res = await fetch(`/api/ui-audit/score?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
      if (!res.ok) return
      const json = (await res.json()) as Resp
      apply(json)
    } catch {
      /* silent */
    }
  }

  const ready = () => {
    // wait for API block to render, then apply
    const obs = new MutationObserver(() => {
      const hasApi = document.querySelector('[data-ui-audit-api]')
      if (hasApi) {
        init()
        obs.disconnect()
      }
    })
    obs.observe(document.documentElement, { childList: true, subtree: true })
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true })
  else ready()
})()

// --- append-only: E-14 unify to API-only display (hide legacy/mock sections) ---
;(() => {
  if (typeof window === 'undefined') return
  const hide = () => {
    const root = document.querySelector('main') || document.body
    if (!root) return
    // Hide blocks that were added by older client/SSR logic (keep only API ones)
    const attrSelectors = [
      '[data-ui-audit-real]',
      '[data-ui-audit-real-contrast]',
      '[data-ui-audit-issues]',
      '[data-ui-audit-radar]',
    ]
    root.querySelectorAll(attrSelectors.join(',')).forEach((el) => {
      ;(el as HTMLElement).style.display = 'none'
    })
    // Hide known titled sections from SSR/mock/client-direct blocks
    const titles = new Set([
      'Summary',
      'Contrast details',
      'Notes',
      'Contrast (AA + AA Large, real data)',
      'Contrast (AA + AA Large, mock)',
      'Issues (contrast) — Jump to node',
      'Alignment & Spacing',
    ])
    root.querySelectorAll('h2').forEach((h) => {
      const t = (h.textContent || '').trim()
      if (titles.has(t)) {
        const sec = h.closest('section') || h.parentElement
        if (sec) (sec as HTMLElement).style.display = 'none'
      }
    })
    // Hide the SSR helper paragraph describing mock metrics
    root.querySelectorAll('p').forEach((p) => {
      const s = (p.textContent || '').toLowerCase()
      if (s.includes('ssr mock metrics')) (p as HTMLElement).style.display = 'none'
    })
  }
  const init = () => { hide() }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true })
  else init()
  // Re-apply when other IIFEs inject legacy blocks
  const mo = new MutationObserver(() => hide())
  mo.observe(document.documentElement, { subtree: true, childList: true })
})()

// --- append-only: API-driven Radar chart (uses /api/ui-audit/score) ---
;(() => {
  if (typeof window === 'undefined') return

  type Scores = { contrast: number; fontVariety: number; gridSpacing: number; alignment: number; average: number }
  type Resp = { slug: string; scores: Scores; issues?: Record<string, string[]>; warning?: string }

  const colorForScore = (s: number) => (s >= 80 ? 'text-green-700' : s >= 50 ? 'text-amber-700' : 'text-rose-700')

  const renderRadar = (scores: Scores) => {
    const labels = ['Contrast', 'FontVariety', 'GridSpacing', 'Alignment']
    const vals = [scores.contrast, scores.fontVariety, scores.gridSpacing, scores.alignment]
    const size = 220
    const cx = size / 2, cy = size / 2, r = size * 0.38
    const N = vals.length
    const toXY = (i: number, vPct: number) => {
      const angle = (-Math.PI / 2) + (i * 2 * Math.PI / N)
      const rr = (vPct / 100) * r
      return [cx + rr * Math.cos(angle), cy + rr * Math.sin(angle)]
    }
    const poly = vals.map((v, i) => toXY(i, v)).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
    const rings = [25, 50, 75, 100]
    const axes = labels.map((_, i) => {
      const [x, y] = toXY(i, 100)
      return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#e5e7eb" stroke-width="1" />`
    }).join('')
    const ringEls = rings.map((p) => `<circle cx="${cx}" cy="${cy}" r="${(p/100*r).toFixed(1)}" fill="none" stroke="#e5e7eb" stroke-width="1" />`).join('')
    const labelEls = labels.map((lbl, i) => {
      const [x, y] = toXY(i, 115)
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="10" fill="#374151">${lbl}</text>`
    }).join('')
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        ${ringEls}
        ${axes}
        <polygon points="${poly}" fill="rgba(59,130,246,0.25)" stroke="#2563eb" stroke-width="2" />
        ${labelEls}
      </svg>
    `
  }

  const init = async () => {
    try {
      const params = new URLSearchParams(window.location.search)
      const slug = params.get('slug') || 'sample'
      const res = await fetch(`/api/ui-audit/score?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
      if (!res.ok) return
      const data = (await res.json()) as Resp
      if (!data || !data.scores) return
      const main = document.querySelector('main') || document.body
      if (!main || (main as any).__apiRadarInjected) return
      const h1 = main.querySelector('h1')
      const box = document.createElement('section')
      box.setAttribute('data-ui-audit-radar-api', '1')
      box.className = 'border rounded p-3 mb-3 flex items-start gap-4'
      const sc = data.scores
      box.innerHTML = `
        <div class="shrink-0">${renderRadar(sc)}</div>
        <div class="space-y-2 text-sm">
          <div class="font-semibold">Scores (API)</div>
          <div>Contrast: <b class="${colorForScore(sc.contrast)}">${sc.contrast}</b></div>
          <div>Font Variety: <b class="${colorForScore(sc.fontVariety)}">${sc.fontVariety}</b></div>
          <div>Grid Spacing: <b class="${colorForScore(sc.gridSpacing)}">${sc.gridSpacing}</b></div>
          <div>Alignment: <b class="${colorForScore(sc.alignment)}">${sc.alignment}</b></div>
          <hr class="my-2 border-gray-200" />
          <div>Average: <b class="${colorForScore(sc.average)}">${sc.average}</b></div>
          ${data.warning ? `<div class="text-xs text-amber-700">${data.warning}</div>` : ''}
        </div>
      `
      if (h1?.parentElement) h1.parentElement.insertBefore(box, h1.nextSibling)
      else main.insertBefore(box, main.firstChild)
      ;(main as any).__apiRadarInjected = true
    } catch {
      // fail silently; mock radar stays visible
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { void init() }, { once: true })
  else void init()
})()

// --- append-only: E-12 API-based scoreboard fetch (/api/ui-audit/score?slug=...) ---
;(() => {
  if (typeof window === 'undefined') return

  type Scores = { contrast: number; fontVariety: number; gridSpacing: number; alignment: number; average: number }
  type Issues = { contrast: string[]; fontVariety: string[]; gridSpacing: string[]; alignment: string[] }
  type Resp = { slug: string; scores: Scores; issues: Issues; warning?: string }

  const jump = (id: string) => {
    const w = window as any
    try { w.__panel = 'lineage' } catch {}
    try { if (typeof w.__builderStore?.select === 'function') w.__builderStore.select(id) } catch {}
    try { w.__chizuSel = id } catch {}
  }

  const color = (v: number) => (v >= 80 ? 'text-green-700' : v >= 50 ? 'text-amber-700' : 'text-rose-700')

  const render = (data: Resp) => {
    const main = document.querySelector('main') || document.body
    if (!main || (main as any).__apiScoreInjected) return
    const h1 = main.querySelector('h1')
    const wrap = document.createElement('section')
    wrap.setAttribute('data-ui-audit-api', '1')
    wrap.className = 'border rounded p-3 mb-3'
    const warn = data.warning ? `<div class="text-amber-600 text-xs mb-2">${data.warning}</div>` : ''
    const entries = Object.entries(data.scores)
      .map(([k, v]) => `<div class="border rounded p-2"><strong>${k}</strong>: <span class="${color(v)}">${v}</span></div>`)
      .join('')
    const issues = Object.entries(data.issues)
      .map(([k, ids]) => {
        const items = (ids || []).map((id) =>
          `<li><span class="font-mono">${id}</span> <button class="underline text-blue-600 hover:text-blue-800" data-jump="${id}">→ Jump</button></li>`
        ).join('')
        return `<div><h3 class="text-sm font-semibold">Issues: ${k}</h3><ul class="list-disc pl-4 text-xs space-y-1">${items || '<li class="text-gray-400">none</li>'}</ul></div>`
      })
      .join('')
    wrap.innerHTML = `
      <h2 class="text-sm font-semibold mb-1">UI Audit (API): ${data.slug}</h2>
      ${warn}
      <div class="grid grid-cols-2 gap-2 text-sm mb-2">${entries}</div>
      <div class="space-y-2">${issues}</div>
    `
    if (h1?.parentElement) h1.parentElement.insertBefore(wrap, h1.nextSibling)
    else main.insertBefore(wrap, main.firstChild)
    wrap.addEventListener('click', (e) => {
      const t = e.target as HTMLElement
      const btn = t.closest('button[data-jump]') as HTMLButtonElement | null
      if (btn) {
        e.preventDefault()
        const id = btn.getAttribute('data-jump') || ''
        if (id) jump(id)
      }
    })
    ;(main as any).__apiScoreInjected = true
  }

  const init = async () => {
    try {
      const params = new URLSearchParams(window.location.search)
      const slug = params.get('slug') || 'sample'
      const res = await fetch(`/api/ui-audit/score?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
      const json = await res.json()
      render(json as Resp)
    } catch (err) {
      // Fail silently to keep page usable
      // console.warn('ui-audit api fetch failed', err)
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { void init() }, { once: true })
  else void init()
})()

// --- append-only: E-10 Radar chart + aggregated scores (client-only, no deps) ---
;(() => {
  if (typeof window === 'undefined') return

  type Node = ComponentNode

  // helpers (local copies)
  const toPx = (fs: string | number | undefined): number | null => {
    if (fs == null) return null
    if (typeof fs === 'number' && isFinite(fs)) return fs
    if (typeof fs === 'string') {
      const m = fs.trim().match(/^(\d+\.?\d*)px$/)
      if (m) return parseFloat(m[1])
    }
    return null
  }
  const isLargeText = (fs?: string | number) => {
    const px = toPx(fs)
    return px !== null && px >= 18.66
  }
  const toNum = (v: any): number | null => {
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
  const getFrame = (n: any): { id: string; x: number; y: number; w: number; h: number } | null => {
    const id: string = String(n?.id ?? '')
    const cands: Array<any> = [
      n,
      n?.frame,
      n?.layout,
      n?.props?.frame,
      { x: n?.style?.left, y: n?.style?.top, width: n?.style?.width, height: n?.style?.height },
    ]
    for (const c of cands) {
      if (!c) continue
      const x = toNum(c.x)
      const y = toNum(c.y)
      const w = toNum(c.w ?? c.width)
      const h = toNum(c.h ?? c.height)
      if (x != null && y != null && w != null && h != null) return { id, x, y, w, h }
    }
    return null
  }

  const snap8 = (v: number) => Math.round(v / 8) * 8
  const onGrid8 = (v: number, tol = 1): boolean => {
    const r = Math.abs(v % 8)
    return r <= tol || Math.abs(8 - r) <= tol
  }

  const loadNodes = async (): Promise<Node[] | null> => {
    const slug = new URLSearchParams(window.location.search).get('slug') || 'sample'
    const url = `/pages/${encodeURIComponent(slug)}.json`
    try {
      const res = await fetch(url, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        const nodes: Node[] | null = Array.isArray(data?.tree)
          ? (data.tree as Node[])
          : (Array.isArray(data) ? (data as Node[]) : null)
        if (nodes) return nodes
      }
    } catch {}
    try { return (loadMockNodes && typeof loadMockNodes === 'function') ? (loadMockNodes() as unknown as Node[]) : null } catch { return null }
  }

  const evalMetrics = (nodes: Node[]) => {
    // contrast compliance
    let cTotal = 0
    let cPass = 0
    const fontSizes = new Set<number>()
    const spacingValues: number[] = []
    // alignment + spacing like E-9
    const frames: Array<{ id: string; L: number; R: number; T: number; B: number }> = []

    const walk = (n: Node) => {
      // font-size variety
      const fs = n.props?.fontSize
      const npx = toPx(fs)
      if (npx !== null) fontSizes.add(npx)
      // spacing collection
      extractPxValues(n.style?.margin).forEach((v) => spacingValues.push(v))
      extractPxValues(n.style?.padding).forEach((v) => spacingValues.push(v))
      // contrast
      const tc = parseColor(n.props?.textColor || '')
      const bg = parseColor(n.props?.bgColor || '')
      const ratio = tc && bg ? contrastRatio(tc, bg) : null
      if (ratio !== null) {
        cTotal++
        const req = isLargeText(fs) ? 3.0 : 4.5
        if (ratio >= req) cPass++
      }
      // frames
      const f = getFrame(n)
      if (f) frames.push({ L: f.x, R: f.x + f.w, T: f.y, B: f.y + f.h, id: n.id })
      // children
      if (n.children) n.children.forEach(walk)
    }
    nodes.forEach(walk)

    const contrastPct = cTotal ? Math.round((cPass / cTotal) * 100) : 100
    // font variety scoring: <=4 -> 100, >=10 -> 0
    const fv = fontSizes.size
    const fontScore = (() => {
      const min = 4, max = 10
      if (fv <= min) return 100
      if (fv >= max) return 0
      return Math.round(100 * (1 - (fv - min) / (max - min)))
    })()

    // spacing grid adherence (using collected margin/padding px)
    const onCount = spacingValues.filter((v) => onGrid8(v)).length
    const spacingPct = spacingValues.length ? Math.round((onCount / spacingValues.length) * 100) : 100

    // alignment & spacing between frames
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

    return { contrastPct, fontScore, spacingPct, alignPct, fontCount: fv }
  }

  const colorForScore = (s: number) => (s >= 80 ? 'text-green-700' : s >= 50 ? 'text-amber-700' : 'text-rose-700')

  const renderRadar = (scores: { contrastPct: number; fontScore: number; spacingPct: number; alignPct: number }) => {
    const labels = ['Contrast', 'FontVariety', 'GridSpacing', 'Alignment']
    const vals = [scores.contrastPct, scores.fontScore, scores.spacingPct, scores.alignPct]
    const size = 220
    const cx = size / 2, cy = size / 2, r = size * 0.38
    const N = vals.length
    const toXY = (i: number, vPct: number) => {
      const angle = (-Math.PI / 2) + (i * 2 * Math.PI / N)
      const rr = (vPct / 100) * r
      return [cx + rr * Math.cos(angle), cy + rr * Math.sin(angle)]
    }

    const poly = vals.map((v, i) => toXY(i, v)).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

    // axes and rings
    const rings = [25, 50, 75, 100]
    const axes = labels.map((_, i) => {
      const [x, y] = toXY(i, 100)
      return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#e5e7eb" stroke-width="1" />`
    }).join('')
    const ringEls = rings.map((p) => `<circle cx="${cx}" cy="${cy}" r="${(p/100*r).toFixed(1)}" fill="none" stroke="#e5e7eb" stroke-width="1" />`).join('')
    const labelEls = labels.map((lbl, i) => {
      const [x, y] = toXY(i, 115)
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="10" fill="#374151">${lbl}</text>`
    }).join('')

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        ${ringEls}
        ${axes}
        <polygon points="${poly}" fill="rgba(59,130,246,0.25)" stroke="#2563eb" stroke-width="2" />
        ${labelEls}
      </svg>
    `
  }

  const render = async () => {
    const nodes = await loadNodes()
    if (!nodes) return
    const m = evalMetrics(nodes)

    const container = document.createElement('section')
    container.className = 'border rounded p-3 mb-3 flex items-start gap-4'
    container.setAttribute('data-ui-audit-radar', '1')
    container.innerHTML = `
      <div class="shrink-0">${renderRadar(m)}</div>
      <div class="space-y-2 text-sm">
        <div class="font-semibold">Scores</div>
        <div>Contrast: <b class="${colorForScore(m.contrastPct)}">${m.contrastPct}</b></div>
        <div>Font Variety: <b class="${colorForScore(m.fontScore)}">${m.fontScore}</b> <span class="opacity-60">(unique=${m.fontCount})</span></div>
        <div>Grid Spacing: <b class="${colorForScore(m.spacingPct)}">${m.spacingPct}</b></div>
        <div>Alignment: <b class="${colorForScore(m.alignPct)}">${m.alignPct}</b></div>
        <hr class="my-2 border-gray-200" />
        <div>Average: <b class="${colorForScore(Math.round((m.contrastPct + m.fontScore + m.spacingPct + m.alignPct)/4))}">${Math.round((m.contrastPct + m.fontScore + m.spacingPct + m.alignPct)/4)}</b></div>
        <div class="text-xs text-gray-600">高スコアほどUIの一貫性・可読性が高い傾向です。詳細は下の各セクションを参照してください。</div>
      </div>
    `
    const main = document.querySelector('main') || document.body
    const h1 = main.querySelector('h1')
    if (h1?.parentElement) h1.parentElement.insertBefore(container, h1.nextSibling)
    else main.insertBefore(container, main.firstChild)
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { void render() }, { once: true })
  else void render()
})()

// --- append-only: E-9 Alignment & Spacing scoring (left/right/top/bottom + 8px grid) ---
;(() => {
  if (typeof window === 'undefined') return

  type Node = ComponentNode

  const toNum = (v: any): number | null => {
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

  const getFrame = (n: any): { id: string; x: number; y: number; w: number; h: number } | null => {
    const id: string = String(n?.id ?? '')
    const cands: Array<any> = [
      n,
      n?.frame,
      n?.layout,
      n?.props?.frame,
      { x: n?.style?.left, y: n?.style?.top, width: n?.style?.width, height: n?.style?.height },
    ]
    for (const c of cands) {
      if (!c) continue
      const x = toNum(c.x)
      const y = toNum(c.y)
      const w = toNum(c.w ?? c.width)
      const h = toNum(c.h ?? c.height)
      if (x != null && y != null && w != null && h != null) return { id, x, y, w, h }
    }
    return null
  }

  const snap8 = (v: number) => Math.round(v / 8) * 8
  const onGrid8 = (v: number, tol = 1): boolean => {
    const r = Math.abs(v % 8)
    return r <= tol || Math.abs(8 - r) <= tol
  }

  const evalAlignmentAndSpacing = (nodes: Node[]) => {
    // collect frames
    const frames: Array<{ id: string; x: number; y: number; w: number; h: number; L: number; R: number; T: number; B: number }> = []
    const collect = (n: any) => {
      const f = getFrame(n)
      if (f) frames.push({ ...f, L: f.x, R: f.x + f.w, T: f.y, B: f.y + f.h })
      if (n?.children) n.children.forEach(collect)
    }
    nodes.forEach(collect)

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
    const alignedRate = total ? Math.round((alignedSet.size / total) * 100) : 100

    // spacing: horizontal and vertical gaps between non-overlapping frames with overlap in the orthogonal axis
    type Gap = { a: string; b: string; d: number; kind: 'H' | 'V' }
    const gaps: Gap[] = []
    for (let i = 0; i < frames.length; i++) {
      const A = frames[i]
      for (let j = i + 1; j < frames.length; j++) {
        const B = frames[j]
        // horizontal gap (rows overlap vertically)
        const vOverlap = !(A.B <= B.T || B.B <= A.T)
        if (vOverlap) {
          // gap to right
          if (A.R <= B.L) gaps.push({ a: A.id, b: B.id, d: Math.max(0, B.L - A.R), kind: 'H' })
          if (B.R <= A.L) gaps.push({ a: B.id, b: A.id, d: Math.max(0, A.L - B.R), kind: 'H' })
        }
        // vertical gap (columns overlap horizontally)
        const hOverlap = !(A.R <= B.L || B.R <= A.L)
        if (hOverlap) {
          if (A.B <= B.T) gaps.push({ a: A.id, b: B.id, d: Math.max(0, B.T - A.B), kind: 'V' })
          if (B.B <= A.T) gaps.push({ a: B.id, b: A.id, d: Math.max(0, A.T - B.B), kind: 'V' })
        }
      }
    }
    const gapsH = gaps.filter((g) => g.kind === 'H' && g.d > 0)
    const gapsV = gaps.filter((g) => g.kind === 'V' && g.d > 0)
    const hOn = gapsH.filter((g) => onGrid8(g.d)).length
    const vOn = gapsV.filter((g) => onGrid8(g.d)).length
    const hRate = gapsH.length ? Math.round((hOn / gapsH.length) * 100) : 100
    const vRate = gapsV.length ? Math.round((vOn / gapsV.length) * 100) : 100

    // details
    const misaligned = frames.filter((f) => !alignedSet.has(f.id)).slice(0, 12)
    const offGrid = gaps.filter((g) => g.d > 0 && !onGrid8(g.d)).sort((a, b) => b.d - a.d).slice(0, 12)

    return { total, alignedRate, hRate, vRate, misaligned, offGrid }
  }

  const jump = (id: string) => {
    const w = window as any
    try { w.__panel = 'lineage' } catch {}
    try { if (typeof w.__builderStore?.select === 'function') w.__builderStore.select(id) } catch {}
    try { w.__chizuSel = id } catch {}
  }

  const render = async () => {
    // load real nodes or mock
    let nodes: Node[] | null = null
    const slug = new URLSearchParams(window.location.search).get('slug') || 'sample'
    const url = `/pages/${encodeURIComponent(slug)}.json`
    try {
      const res = await fetch(url, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        nodes = Array.isArray(data?.tree) ? (data.tree as Node[]) : (Array.isArray(data) ? (data as Node[]) : null)
      }
    } catch {}
    if (!nodes) {
      try { nodes = (loadMockNodes && typeof loadMockNodes === 'function') ? (loadMockNodes() as unknown as Node[]) : null } catch { nodes = null }
    }
    if (!nodes) return

    const { total, alignedRate, hRate, vRate, misaligned, offGrid } = evalAlignmentAndSpacing(nodes)

    const main = document.querySelector('main') || document.body
    const anchor = document.querySelector('[data-ui-audit-issues]') || document.querySelector('[data-ui-audit-real]') || document.querySelector('h1')
    if (!main || !anchor) return
    const section = document.createElement('section')
    section.className = 'space-y-3 border rounded p-3'
    section.innerHTML = `
      <h2 class="font-semibold">Alignment & Spacing</h2>
      <div class="grid grid-cols-3 gap-3 text-sm">
        <div class="border rounded p-2"><div class="text-xs opacity-70">整列率 (L/R)</div><div class="text-xl font-semibold">${alignedRate}%</div><div class="text-xs text-gray-600">対象 ${total} ノード</div></div>
        <div class="border rounded p-2"><div class="text-xs opacity-70">spacing (水平) 8px倍率</div><div class="text-xl font-semibold">${hRate}%</div><div class="text-xs text-gray-600">off-grid ${Math.max(0, (offGrid.filter(g=>g.kind==='H').length))}</div></div>
        <div class="border rounded p-2"><div class="text-xs opacity-70">spacing (垂直) 8px倍率</div><div class="text-xl font-semibold">${vRate}%</div><div class="text-xs text-gray-600">off-grid ${Math.max(0, (offGrid.filter(g=>g.kind==='V').length))}</div></div>
      </div>
      <div class="space-y-2" data-ui-audit-align-details></div>
    `
    anchor.parentElement?.insertBefore(section, anchor.nextSibling)

    const details = section.querySelector('[data-ui-audit-align-details]') as HTMLElement
    if (misaligned.length > 0) {
      const box = document.createElement('div')
      box.className = 'space-y-1'
      const h = document.createElement('div')
      h.className = 'text-sm font-semibold'
      h.textContent = `Misaligned nodes (sample)`
      box.appendChild(h)
      for (const f of misaligned) {
        const row = document.createElement('div')
        row.className = 'border rounded p-2 text-xs flex items-center gap-3 border-amber-300 bg-amber-50'
        const meta = document.createElement('div')
        meta.className = 'flex-1'
        meta.innerHTML = `<span class="font-mono">${f.id}</span> <span class="opacity-60">L=${Math.round(f.L)} R=${Math.round(f.R)}</span>`
        const btn = document.createElement('button')
        btn.className = 'text-[11px] underline text-blue-600 hover:text-blue-800 px-2 py-1'
        btn.textContent = '→ Jump'
        btn.addEventListener('click', () => jump(f.id))
        row.appendChild(meta)
        row.appendChild(btn)
        box.appendChild(row)
      }
      details.appendChild(box)
    }
    if (offGrid.length > 0) {
      const box = document.createElement('div')
      box.className = 'space-y-1'
      const h = document.createElement('div')
      h.className = 'text-sm font-semibold'
      h.textContent = `Off-grid spacings (top 12)`
      box.appendChild(h)
      for (const g of offGrid) {
        const row = document.createElement('div')
        row.className = 'border rounded p-2 text-xs flex items-center gap-3 border-rose-300 bg-rose-50'
        const meta = document.createElement('div')
        meta.className = 'flex-1'
        meta.textContent = `${g.kind} gap ${Math.round(g.d)}px between ${g.a} → ${g.b}`
        box.appendChild(meta)
        details.appendChild(row)
        row.appendChild(meta)
      }
      details.appendChild(box)
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render, { once: true })
  else render()
})()

// --- append-only: E-8 Jump to node (select in right pane) ---
;(() => {
  if (typeof window === 'undefined') return

  type Node = ComponentNode

  const toPx = (fs: string | number | undefined): number | null => {
    if (fs == null) return null
    if (typeof fs === 'number' && isFinite(fs)) return fs
    if (typeof fs === 'string') {
      const m = fs.trim().match(/^(\d+\.?\d*)px$/)
      if (m) return parseFloat(m[1])
    }
    return null
  }
  const isLargeText = (fs?: string | number) => {
    const px = toPx(fs)
    return px !== null && px >= 18.66
  }

  const evalIssues = (nodes: Node[]) => {
    const rows: Array<{ id: string; type: string; ratio: number | null; large: boolean; req: number }> = []
    const collect = (n: Node) => {
      const tc = parseColor(n.props?.textColor || '')
      const bg = parseColor(n.props?.bgColor || '')
      const ratio = tc && bg ? contrastRatio(tc, bg) : null
      const large = isLargeText(n.props?.fontSize)
      const req = large ? 3.0 : 4.5
      rows.push({ id: n.id, type: n.type, ratio, large, req })
      if (n.children) n.children.forEach(collect)
    }
    nodes.forEach(collect)
    return rows.filter(r => r.ratio !== null && (r.ratio as number) < r.req)
  }

  const renderIssues = (issues: ReturnType<typeof evalIssues>, title: string, anchor: Element | null) => {
    if (!anchor || issues.length === 0) return
    const section = document.createElement('section')
    section.setAttribute('data-ui-audit-issues', '1')
    section.className = 'space-y-2 border rounded p-3'
    const h2 = document.createElement('h2')
    h2.className = 'font-semibold'
    h2.textContent = title
    section.appendChild(h2)
    const list = document.createElement('div')
    list.className = 'space-y-1 text-xs'
    section.appendChild(list)
    for (const r of issues) {
      const row = document.createElement('div')
      row.className = 'border rounded p-2 border-rose-300 bg-rose-50 flex items-center gap-3'
      const meta = document.createElement('div')
      meta.className = 'flex-1'
      meta.innerHTML = `
        <div class="font-mono text-[11px]">${r.id} <span class="opacity-60">(${r.type})</span></div>
        <div>ratio: <b>${r.ratio ? (r.ratio as number).toFixed(2) : '-'}</b> 
          <span class="ml-2">required: <b>${r.req.toFixed(1)}</b>${r.large ? ' <span class="opacity-60">(AA Large)</span>' : ''}</span>
        </div>
      `
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'text-[11px] underline text-blue-600 hover:text-blue-800 px-2 py-1'
      btn.textContent = '→ Jump'
      btn.addEventListener('click', () => {
        const w = window as any
        try { w.__panel = 'lineage' } catch {}
        try { if (typeof w.__builderStore?.select === 'function') w.__builderStore.select(r.id) } catch {}
        try { w.__chizuSel = r.id } catch {}
      })
      row.appendChild(meta)
      row.appendChild(btn)
      list.appendChild(row)
    }
    const ref = anchor as HTMLElement
    ref.parentElement?.insertBefore(section, ref.nextSibling)
  }

  const render = async () => {
    // prefer real data; fallback to mock
    let nodes: Node[] | null = null
    const slug = new URLSearchParams(window.location.search).get('slug') || 'sample'
    const url = `/pages/${encodeURIComponent(slug)}.json`
    try {
      const res = await fetch(url, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        nodes = Array.isArray(data?.tree) ? (data.tree as Node[]) : (Array.isArray(data) ? (data as Node[]) : null)
      }
    } catch {}
    if (!nodes) {
      try { nodes = (loadMockNodes && typeof loadMockNodes === 'function') ? loadMockNodes() as unknown as Node[] : null } catch { nodes = null }
    }
    if (!nodes || nodes.length === 0) return
    const issues = evalIssues(nodes)
    const anchor = document.querySelector('[data-ui-audit-real]') || document.querySelector('h1')
    renderIssues(issues, 'Issues (contrast) — Jump to node', anchor)
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render, { once: true })
  else render()
})()

// --- append-only: E-7 Large text AA threshold (3.0) evaluation blocks ---
;(() => {
  if (typeof window === 'undefined') return

  type Node = ComponentNode

  const toPx = (fs: string | number | undefined): number | null => {
    if (fs == null) return null
    if (typeof fs === 'number' && isFinite(fs)) return fs
    if (typeof fs === 'string') {
      const m = fs.trim().match(/^(\d+\.?\d*)px$/)
      if (m) return parseFloat(m[1])
    }
    return null
  }

  const isLargeText = (fs: string | number | undefined): boolean => {
    const px = toPx(fs)
    return px !== null && px >= 18.66 // Bold 14px 未判定のため、サイズのみで近似
  }

  const evalContrast = (nodes: Node[]) => {
    const rows: Array<{ id: string; type: string; ratio: number | null; fs?: string | number }> = []
    const collect = (n: Node) => {
      const tc = parseColor(n.props?.textColor || '')
      const bg = parseColor(n.props?.bgColor || '')
      const ratio = tc && bg ? contrastRatio(tc, bg) : null
      rows.push({ id: n.id, type: n.type, ratio, fs: n.props?.fontSize })
      if (n.children) n.children.forEach(collect)
    }
    nodes.forEach(collect)
    return rows
  }

  const renderBlock = (anchor: Element | null, title: string, rows: Array<{ id: string; type: string; ratio: number | null; fs?: string | number }>) => {
    if (!anchor) return
    const wrap = document.createElement('section')
    wrap.className = 'space-y-2 border rounded p-3'
    const header = document.createElement('h2')
    header.className = 'font-semibold'
    header.textContent = title
    wrap.appendChild(header)
    const list = document.createElement('div')
    list.className = 'space-y-1 text-xs'
    wrap.appendChild(list)
    for (const r of rows) {
      const large = isLargeText(r.fs)
      const ratio = r.ratio
      const passAA = ratio !== null ? ratio >= 4.5 : false
      const passLarge = ratio !== null ? ratio >= 3.0 : false
      const cls = ratio === null ? 'border-gray-200' : passAA ? 'border-gray-200' : passLarge ? 'border-amber-300 bg-amber-50' : 'border-rose-300 bg-rose-50'
      const div = document.createElement('div')
      div.className = `border rounded p-2 ${cls}`
      const aa = passAA ? '✓' : '✖'
      const al = passLarge ? '✓' : '✖'
      div.innerHTML = `
        <div class="font-mono text-[11px]">${r.id} <span class="opacity-60">(${r.type})</span></div>
        <div>
          ratio: <b>${ratio ? ratio.toFixed(2) : '-'}</b>
          <span class="ml-2">AA: <b>${aa}</b></span>
          <span class="ml-2">AA Large: <b>${al}</b>${large ? ' <span class="opacity-60">(large)</span>' : ''}</span>
        </div>
      `
      list.appendChild(div)
    }
    // insert after the anchor
    const ref = anchor as HTMLElement
    ref.parentElement?.insertBefore(wrap, ref.nextSibling)
  }

  // Real data block (re-fetch using ?slug, same as earlier IIFE)
  const renderReal = async () => {
    const slug = new URLSearchParams(window.location.search).get('slug') || 'sample'
    const url = `/pages/${encodeURIComponent(slug)}.json`
    try {
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) throw new Error(String(res.status))
      const data = await res.json()
      const nodes: Node[] | null = Array.isArray(data?.tree) ? (data.tree as Node[]) : (Array.isArray(data) ? (data as Node[]) : null)
      if (!nodes) throw new Error('invalid tree')
      const rows = evalContrast(nodes)
      const anchor = document.querySelector('[data-ui-audit-real]') || document.querySelector('h1')
      renderBlock(anchor, 'Contrast (AA + AA Large, real data)', rows)
    } catch {
      /* ignore */
    }
  }

  // Mock data block (uses loadMockNodes from module scope)
  const renderMock = () => {
    try {
      const nodes = (loadMockNodes && typeof loadMockNodes === 'function') ? loadMockNodes() as unknown as Node[] : []
      if (!nodes || !Array.isArray(nodes) || nodes.length === 0) return
      const rows = evalContrast(nodes)
      const h1 = document.querySelector('h1')
      renderBlock(h1, 'Contrast (AA + AA Large, mock)', rows)
    } catch {
      /* ignore */
    }
  }

  const init = () => { renderReal(); renderMock() }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true })
  else init()
})()
