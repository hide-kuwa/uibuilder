// apps/builder/app/dev/pages/page.tsx
import fs from 'node:fs'
import path from 'node:path'

type PageMeta = {
  slug: string
  title?: string
  tags?: string[]
  updatedAt?: string
  contentHash?: string
  exportable?: boolean
}

function listJsonFiles(dir: string): Array<{ name: string; abs: string; mtimeMs: number }> {
  try {
    const ents = fs.readdirSync(dir, { withFileTypes: true })
    const out: Array<{ name: string; abs: string; mtimeMs: number }> = []
    for (const ent of ents) {
      if (ent.isFile() && ent.name.toLowerCase().endsWith('.json')) {
        const abs = path.join(dir, ent.name)
        const st = fs.statSync(abs)
        out.push({ name: ent.name, abs, mtimeMs: st.mtimeMs })
      }
    }
    out.sort((a, b) => b.mtimeMs - a.mtimeMs)
    return out
  } catch {
    return []
  }
}

function listExportZips(dir: string): Array<{ name: string; abs: string; mtimeMs: number; slugPart: string; hashPart: string }> {
  try {
    const ents = fs.readdirSync(dir, { withFileTypes: true })
    const out: Array<{ name: string; abs: string; mtimeMs: number; slugPart: string; hashPart: string }> = []
    for (const ent of ents) {
      if (!ent.isFile() || !ent.name.toLowerCase().endsWith('.zip')) continue
      const abs = path.join(dir, ent.name)
      const st = fs.statSync(abs)
      const base = path.basename(ent.name, '.zip')
      const parts = base.split('--')
      const slugPart = parts[0] || ''
      const hashPart = parts[1] || ''
      out.push({ name: ent.name, abs, mtimeMs: st.mtimeMs, slugPart, hashPart })
    }
    out.sort((a, b) => b.mtimeMs - a.mtimeMs)
    return out
  } catch {
    return []
  }
}

function pickLatestExportHref(exportsDir: string, zips: ReturnType<typeof listExportZips>, slug: string, contentHash?: string) {
  // Prefer match by hash, else by slug prefix
  if (contentHash) {
    const byHash = zips.find(z => z.hashPart && z.hashPart.toLowerCase() === contentHash.toLowerCase())
    if (byHash) return `/exports/${byHash.name}`
    // fallback: look for any name containing --<hash>
    const alt = zips.find(z => z.name.toLowerCase().includes(`--${contentHash.toLowerCase()}`))
    if (alt) return `/exports/${alt.name}`
  }
  if (slug) {
    const bySlug = zips.find(z => z.slugPart === slug)
    if (bySlug) return `/exports/${bySlug.name}`
  }
  return null
}

export default async function Page({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const pagesDir = path.join(process.cwd(), 'public', 'pages')
  const exportsDir = path.join(process.cwd(), 'public', 'exports')
  const files = listJsonFiles(pagesDir)
  const zips = listExportZips(exportsDir)

  const tagQuery = (typeof searchParams?.tag === 'string' ? searchParams?.tag : '')?.trim() || ''
  const hashQuery = (typeof searchParams?.hash === 'string' ? searchParams?.hash : '')?.trim() || ''
  const sortBy = (typeof searchParams?.sort === 'string' ? searchParams?.sort : 'updatedAt') as 'updatedAt' | 'title'

  const rows = files.map((f) => {
    let meta: PageMeta = { slug: path.basename(f.name, '.json') }
    try {
      const txt = fs.readFileSync(f.abs, 'utf8')
      const json = JSON.parse(txt)
      meta = { ...meta, ...(json as PageMeta) }
    } catch {}
    const slug = meta.slug || path.basename(f.name, '.json')
    const mtime = new Date(f.mtimeMs)
    const updatedAt = meta.updatedAt || mtime.toISOString()
    const exportHref = pickLatestExportHref(exportsDir, zips, slug, meta.contentHash)
    return {
      slug,
      title: meta.title || '',
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      updatedAt,
      updated: mtime,
      contentHash: meta.contentHash || '',
      exportable: meta.exportable !== false,
      exportHref,
    }
  })

  const filtered = rows.filter((r) => {
    if (tagQuery) {
      const m = r.tags.some((t) => t.toLowerCase().includes(tagQuery.toLowerCase()))
      if (!m) return false
    }
    if (hashQuery) {
      if (!r.contentHash || !r.contentHash.toLowerCase().includes(hashQuery.toLowerCase())) return false
    }
    return true
  })

  filtered.sort((a, b) => {
    if (sortBy === 'title') return (a.title || a.slug).localeCompare(b.title || b.slug)
    return b.updated.getTime() - a.updated.getTime()
  })

  // --- append-only: aggregate tag counts for tag cloud ---
  const tagCounts = (() => {
    const m = new Map<string, number>()
    for (const r of rows) {
      for (const t of r.tags || []) {
        if (!t) continue
        const k = String(t)
        m.set(k, (m.get(k) || 0) + 1)
      }
    }
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  })()

  return (
    <main className="p-4 space-y-3">
      <h1 className="text-lg font-semibold">Pages</h1>

      <form method="GET" className="flex flex-wrap items-end gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-xs opacity-70">Tag</span>
          <input name="tag" defaultValue={tagQuery} className="border rounded px-2 py-1" placeholder="e.g. finance" />
        </label>
        <label className="flex items-center gap-2">
          <span className="text-xs opacity-70">Hash</span>
          <input name="hash" defaultValue={hashQuery} className="border rounded px-2 py-1" placeholder="starts-with..." />
        </label>
        <label className="flex items-center gap-2">
          <span className="text-xs opacity-70">Sort</span>
          <select name="sort" defaultValue={sortBy} className="border rounded px-2 py-1">
            <option value="updatedAt">updatedAt</option>
            <option value="title">title</option>
          </select>
        </label>
        <button type="submit" className="px-3 py-1 border rounded">Apply</button>
      </form>

      {/* --- append-only: Tag list (click to filter) --- */}
      <div className="flex flex-wrap items-center gap-2 text-sm" data-pages-tag-cloud>
        <span className="text-xs opacity-70 mr-1">Tags:</span>
        <button
          data-tag=""
          className={`px-2 py-1 border rounded ${!tagQuery ? 'bg-gray-100' : ''}`}
          title="Show all"
        >
          All
        </button>
        {tagCounts.length === 0 ? (
          <span className="text-xs text-gray-500">no tags</span>
        ) : (
          tagCounts.map(([tag, count]) => (
            <button
              key={tag}
              data-tag={tag}
              className={`px-2 py-1 border rounded hover:bg-gray-50 ${tagQuery && tag.toLowerCase() === tagQuery.toLowerCase() ? 'bg-blue-50 border-blue-300' : ''}`}
              title={`filter by: ${tag}`}
            >
              tag: {tag} ({count})
            </button>
          ))
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-600">No pages found under public/pages</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <div key={r.slug} className="grid grid-cols-[1fr,1.5fr,1fr,1fr,auto,auto] gap-3 items-center border rounded p-2">
              <div className="text-xs font-mono" title={r.slug}>{r.slug}</div>
              <div className="text-xs" title={r.title}>{r.title || '-'}</div>
              <div className="text-xs truncate" title={(r.tags || []).join(', ')}>{(r.tags || []).join(', ') || '-'}</div>
              <div className="text-xs text-gray-700" title={r.updatedAt}>{new Date(r.updatedAt).toLocaleString()}</div>
              {r.exportHref ? (
                <a className="text-xs underline text-blue-600 hover:text-blue-800" href={r.exportHref}>Export</a>
              ) : (
                <span className="text-xs text-gray-400">Export不可</span>
              )}
              {r.contentHash ? (
                <a className="text-xs underline text-blue-600 hover:text-blue-800" href={`/audit?hash=${encodeURIComponent(r.contentHash)}`}>Audit</a>
              ) : (
                <span className="text-xs text-gray-400">Audit</span>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

// --- append-only: client-side wiring for tag buttons (history.replaceState + reload) ---
;(() => {
  if (typeof window === 'undefined') return
  const init = () => {
    const wrap = document.querySelector('[data-pages-tag-cloud]')
    if (!wrap || (wrap as any).__tagCloudBound) return
    wrap.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement) || null
      const btn = target?.closest('button[data-tag]') as HTMLButtonElement | null
      if (!btn) return
      e.preventDefault()
      const tag = btn.getAttribute('data-tag') || ''
      const url = new URL(window.location.href)
      if (tag) url.searchParams.set('tag', tag)
      else url.searchParams.delete('tag')
      history.replaceState(null, '', url.toString())
      window.location.reload()
    })
    ;(wrap as any).__tagCloudBound = true
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true })
  } else {
    init()
  }
})()

// --- append-only: E-31 Edit link per row + hidden toggle via API ---
;(() => {
  if (typeof window === 'undefined') return

  type Meta = { slug: string; hidden?: boolean }

  const findForm = () => {
    const h1 = Array.from(document.querySelectorAll('h1')).find((n) => (n.textContent || '').trim() === 'Pages')
    return (h1?.parentElement?.querySelector('form') as HTMLFormElement | null) || null
  }
  const listContainer = () => {
    const form = findForm()
    return (form?.nextElementSibling as HTMLElement | null) || null
  }
  const findRows = (): HTMLElement[] => {
    const cont = listContainer()
    if (!cont) return []
    return Array.from(cont.querySelectorAll('div.grid')) as HTMLElement[]
  }
  const slugFromRow = (row: HTMLElement) => (row.children.item(0)?.textContent || '').trim()

  const injectControls = () => {
    const form = findForm()
    if (!form || (form as any).__hiddenToggle) return
    const wrap = document.createElement('div')
    wrap.className = 'flex items-center gap-3 text-sm mt-2'
    const label = document.createElement('label')
    label.className = 'flex items-center gap-2'
    const cb = document.createElement('input')
    cb.type = 'checkbox'
    cb.name = 'showHiddenUI'
    const span = document.createElement('span')
    span.textContent = 'Show hidden'
    label.appendChild(cb)
    label.appendChild(span)
    wrap.appendChild(label)
    form.appendChild(wrap)
    const params = new URLSearchParams(window.location.search)
    const show = params.get('showHidden') === '1'
    cb.checked = show
    cb.addEventListener('change', () => {
      const url = new URL(window.location.href)
      if (cb.checked) url.searchParams.set('showHidden', '1')
      else url.searchParams.delete('showHidden')
      history.replaceState(null, '', url.toString())
      window.location.reload()
    })
    ;(form as any).__hiddenToggle = true
  }

  const injectEditLinks = () => {
    const rows = findRows()
    for (const row of rows) {
      if (row.querySelector('[data-edit-link]')) continue
      const slug = slugFromRow(row)
      const link = document.createElement('a')
      link.setAttribute('data-edit-link', '1')
      link.href = `/dev/pages/edit?slug=${encodeURIComponent(slug)}`
      link.className = 'text-xs underline text-blue-600 hover:text-blue-800'
      link.textContent = 'Edit'
      const actionsCell = document.createElement('div')
      actionsCell.className = 'text-right'
      actionsCell.appendChild(link)
      row.appendChild(actionsCell)
    }
  }

  const applyHiddenFilter = async () => {
    const show = new URLSearchParams(window.location.search).get('showHidden') === '1'
    if (show) return
    try {
      const res = await fetch('/api/pages?showHidden=1', { cache: 'no-store' })
      const j = await res.json()
      if (!j?.ok || !Array.isArray(j.items)) return
      const hiddenSet = new Set<string>(j.items.filter((m: Meta) => m.hidden).map((m: Meta) => m.slug))
      const rows = findRows()
      for (const row of rows) {
        const slug = slugFromRow(row)
        if (hiddenSet.has(slug)) row.style.display = 'none'
      }
    } catch {}
  }

  const init = () => {
    injectControls()
    injectEditLinks()
    void applyHiddenFilter()
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true })
  else init()
})()

// --- append-only: E-28 Audit Issue Rankings (contrast / spacing / alignment) ---
;(() => {
  if (typeof window === 'undefined') return

  type ScoreResp = { issues?: { contrast?: string[]; gridSpacing?: string[]; alignment?: string[] } }

  const findRows = (): HTMLElement[] => {
    const h1 = Array.from(document.querySelectorAll('h1')).find((n) => (n.textContent || '').trim() === 'Pages')
    const form = h1?.parentElement?.querySelector('form') as HTMLFormElement | null
    const list = (form?.nextElementSibling as HTMLElement | null) || null
    if (!list) return []
    return Array.from(list.querySelectorAll('div.grid')) as HTMLElement[]
  }

  const slugFromRow = (row: HTMLElement) => (row.children.item(0)?.textContent || '').trim()

  const fetchIssues = async (slug: string): Promise<ScoreResp | null> => {
    try {
      const res = await fetch(`/api/ui-audit/score?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
      if (!res.ok) return null
      return (await res.json()) as ScoreResp
    } catch { return null }
  }

  const render = (rank: {
    contrast: Array<{ slug: string; n: number }>
    gridSpacing: Array<{ slug: string; n: number }>
    alignment: Array<{ slug: string; n: number }>
  }) => {
    const main = document.querySelector('main') || document.body
    const h1 = main.querySelector('h1')
    if (!main || !h1) return
    if ((main as any).__issueRankingInjected) return

    const section = document.createElement('section')
    section.setAttribute('data-issue-rankings', '1')
    section.className = 'border rounded p-3 space-y-2'
    section.innerHTML = `
      <div class="font-semibold">Audit Issue Rankings</div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div class="border rounded p-2">
          <div class="text-xs opacity-70">Contrast Issues (Top 5)</div>
          <div class="mt-1 space-y-1">$${'{'}rank.contrast.length ? rank.contrast.map((r, i) => `
            <div class=\"flex items-center justify-between\"><a class=\"underline text-blue-600 hover:text-blue-800\" href=\"/audit?slug=${'${'}encodeURIComponent(r.slug)${'}'}\">${'${'}r.slug${'}'}</a><span class=\"font-mono\">${'${'}r.n${'}'}</span></div>
          `).join('') : '<div class=\\"text-xs text-gray-500\\">No data</div>'$${'}'}</div>
        </div>
        <div class="border rounded p-2">
          <div class="text-xs opacity-70">Spacing Issues (Top 5)</div>
          <div class="mt-1 space-y-1">$${'{'}rank.gridSpacing.length ? rank.gridSpacing.map((r, i) => `
            <div class=\"flex items-center justify-between\"><a class=\"underline text-blue-600 hover:text-blue-800\" href=\"/audit?slug=${'${'}encodeURIComponent(r.slug)${'}'}\">${'${'}r.slug${'}'}</a><span class=\"font-mono\">${'${'}r.n${'}'}</span></div>
          `).join('') : '<div class=\\"text-xs text-gray-500\\">No data</div>'$${'}'}</div>
        </div>
        <div class="border rounded p-2">
          <div class="text-xs opacity-70">Alignment Issues (Top 5)</div>
          <div class="mt-1 space-y-1">$${'{'}rank.alignment.length ? rank.alignment.map((r, i) => `
            <div class=\"flex items-center justify-between\"><a class=\"underline text-blue-600 hover:text-blue-800\" href=\"/audit?slug=${'${'}encodeURIComponent(r.slug)${'}'}\">${'${'}r.slug${'}'}</a><span class=\"font-mono\">${'${'}r.n${'}'}</span></div>
          `).join('') : '<div class=\\"text-xs text-gray-500\\">No data</div>'$${'}'}</div>
        </div>
      </div>
    `
    // resolve the $${} JS template placeholders
    section.innerHTML = section.innerHTML.replace(/\$\$\{([^}]+)\}/g, (_, expr) => {
      try { return eval(expr) } catch { return '' }
    })
    if (h1.parentElement) h1.parentElement.insertBefore(section, h1.nextSibling)
    ;(main as any).__issueRankingInjected = true
  }

  const init = async () => {
    try {
      const rows = findRows()
      if (rows.length === 0) return
      const slugs = Array.from(new Set(rows.map(slugFromRow).filter(Boolean))) as string[]
      const counts = new Map<string, { contrast: number; gridSpacing: number; alignment: number }>()
      for (const slug of slugs) {
        const d = await fetchIssues(slug)
        if (!d || !d.issues) continue
        counts.set(slug, {
          contrast: Array.isArray(d.issues.contrast) ? d.issues.contrast.length : 0,
          gridSpacing: Array.isArray(d.issues.gridSpacing) ? d.issues.gridSpacing.length : 0,
          alignment: Array.isArray(d.issues.alignment) ? d.issues.alignment.length : 0,
        })
      }
      const arr = Array.from(counts.entries()).map(([slug, v]) => ({ slug, ...v }))
      const top5 = (key: 'contrast' | 'gridSpacing' | 'alignment') => arr.sort((a, b) => (b[key] - a[key])).slice(0, 5).map(x => ({ slug: x.slug, n: (x as any)[key] as number }))
      render({ contrast: top5('contrast'), gridSpacing: top5('gridSpacing'), alignment: top5('alignment') })
    } catch {
      // ignore quietly
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { void init() }, { once: true })
  else void init()
})()

// --- append-only: E-27 Visual score highlighting + client sort toggle ---
;(() => {
  if (typeof window === 'undefined') return

  type ScoresResp = { scores?: { average?: number } }

  const colorBg = (v: number) => (v >= 80 ? '' : v >= 50 ? 'bg-amber-50' : 'bg-rose-50')

  const findForm = () => {
    const h1 = Array.from(document.querySelectorAll('h1')).find((n) => (n.textContent || '').trim() === 'Pages')
    return (h1?.parentElement?.querySelector('form') as HTMLFormElement | null) || null
  }
  const findListContainer = () => {
    const form = findForm()
    return (form?.nextElementSibling as HTMLElement | null) || null
  }
  const findRows = (): HTMLElement[] => {
    const cont = findListContainer()
    if (!cont) return []
    const rows = Array.from(cont.querySelectorAll('div.grid')) as HTMLElement[]
    return rows
  }
  const slugFromRow = (row: HTMLElement) => (row.children.item(0)?.textContent || '').trim()
  const getScoreFromRow = (row: HTMLElement): number | null => {
    // E-19 badge
    const badge = row.querySelector('[data-ui-audit-score]') as HTMLElement | null
    if (badge) {
      const b = badge.querySelector('b')
      const n = b ? Number((b.textContent || '').trim()) : NaN
      if (!Number.isNaN(n)) return n
    }
    const ds = (row as any).dataset?.score
    if (ds != null) {
      const n = Number(ds)
      if (!Number.isNaN(n)) return n
    }
    return null
  }
  const fetchScore = async (slug: string): Promise<number | null> => {
    try {
      const r = await fetch(`/api/ui-audit/score?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
      if (!r.ok) return null
      const j = (await r.json()) as ScoresResp
      const v = typeof j?.scores?.average === 'number' ? j.scores.average : null
      return v
    } catch { return null }
  }

  const ensureScores = async (rows: HTMLElement[], cache = new Map<string, number | null>()) => {
    for (const row of rows) {
      const slug = slugFromRow(row)
      if (!slug) continue
      let sc = getScoreFromRow(row)
      if (sc == null) sc = cache.get(slug) ?? null
      if (sc == null && !cache.has(slug)) {
        sc = await fetchScore(slug)
        cache.set(slug, sc)
      }
      if (typeof sc === 'number') {
        (row as any).dataset.score = String(sc)
      }
    }
    return cache
  }

  const applyHighlight = (rows: HTMLElement[]) => {
    for (const row of rows) {
      const sc = getScoreFromRow(row)
      // remove old bg classes we may have added
      row.classList.remove('bg-amber-50', 'bg-rose-50')
      if (typeof sc === 'number') {
        const cls = colorBg(sc)
        if (cls) row.classList.add(cls)
      }
    }
  }

  const injectSortToggle = (onToggle: (enabled: boolean) => void) => {
    const form = findForm()
    if (!form || (form as any).__sortToggle) return
    const wrap = document.createElement('div')
    wrap.className = 'flex items-center gap-2 text-sm mt-2'
    const label = document.createElement('label')
    label.className = 'flex items-center gap-1'
    const cb = document.createElement('input')
    cb.type = 'checkbox'
    cb.name = 'sortByScoreUI'
    const span = document.createElement('span')
    span.textContent = 'Sort by Score (desc)'
    label.appendChild(cb)
    label.appendChild(span)
    wrap.appendChild(label)
    form.appendChild(wrap)
    cb.addEventListener('change', () => onToggle(cb.checked))
    ;(form as any).__sortToggle = true
  }

  const sortRows = (rows: HTMLElement[], direction: 'desc' | 'asc') => {
    const cont = findListContainer()
    if (!cont) return
    // keep stable fallback index
    rows.forEach((r, i) => { if (!(r as any).dataset.origIndex) (r as any).dataset.origIndex = String(i) })
    const arr = rows.slice()
    const cmp = (a: number | null, b: number | null) => {
      const av = a == null ? -Infinity : a
      const bv = b == null ? -Infinity : b
      return direction === 'desc' ? bv - av : av - bv
    }
    arr.sort((A, B) => cmp(getScoreFromRow(A), getScoreFromRow(B)))
    for (const r of arr) cont.appendChild(r)
  }

  const restoreOrder = (rows: HTMLElement[]) => {
    const cont = findListContainer()
    if (!cont) return
    const arr = rows.slice()
    arr.sort((a, b) => Number((a as any).dataset.origIndex ?? 0) - Number((b as any).dataset.origIndex ?? 0))
    for (const r of arr) cont.appendChild(r)
  }

  const init = async () => {
    const rows = findRows()
    if (rows.length === 0) return
    await ensureScores(rows)
    applyHighlight(rows)
    injectSortToggle((enabled) => {
      if (enabled) sortRows(findRows(), 'desc')
      else restoreOrder(findRows())
    })
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { void init() }, { once: true })
  else void init()
})()

// --- append-only: E-20 UI-Audit score filter/sort (minScore, sort=score|-score) ---
;(() => {
  if (typeof window === 'undefined') return

  type ScoresResp = { scores?: { average?: number } }

  const qs = () => new URLSearchParams(window.location.search)

  const findForm = () => {
    const h1 = Array.from(document.querySelectorAll('h1')).find((n) => (n.textContent || '').trim() === 'Pages')
    const form = h1?.parentElement?.querySelector('form') as HTMLFormElement | null
    return form
  }

  const findListContainer = () => {
    const form = findForm()
    return (form?.nextElementSibling as HTMLElement | null) || null
  }

  const findRows = (): HTMLElement[] => {
    const cont = findListContainer()
    if (!cont) return []
    return Array.from(cont.querySelectorAll('div.grid')) as HTMLElement[]
  }

  const slugFromRow = (row: HTMLElement) => (row.children.item(0)?.textContent || '').trim()

  const ensureControls = () => {
    const form = findForm()
    if (!form || (form as any).__scoreControls) return
    const params = qs()
    const minScoreVal = params.get('minScore') || ''
    const sortVal = params.get('sort') || ''

    const wrap = document.createElement('div')
    wrap.className = 'flex items-center gap-3 text-sm'

    const labMin = document.createElement('label')
    labMin.className = 'flex items-center gap-2'
    const spanMin = document.createElement('span')
    spanMin.className = 'text-xs opacity-70'
    spanMin.textContent = 'Min Score'
    const inputMin = document.createElement('input')
    inputMin.type = 'number'
    inputMin.name = 'minScoreUI'
    inputMin.placeholder = '70'
    inputMin.value = minScoreVal
    inputMin.className = 'border rounded px-2 py-1 text-sm w-[80px]'
    labMin.appendChild(spanMin)
    labMin.appendChild(inputMin)

    const labSort = document.createElement('label')
    labSort.className = 'flex items-center gap-2'
    const spanSort = document.createElement('span')
    spanSort.className = 'text-xs opacity-70'
    spanSort.textContent = 'Sort(score)'
    const sel = document.createElement('select')
    sel.name = 'sortScoreUI'
    sel.className = 'border rounded px-2 py-1 text-sm'
    ;[
      { v: '', t: '—' },
      { v: 'score', t: 'score (desc)' },
      { v: '-score', t: 'score (asc)' },
    ].forEach(({ v, t }) => {
      const o = document.createElement('option')
      o.value = v
      o.textContent = t
      sel.appendChild(o)
    })
    sel.value = sortVal === 'score' || sortVal === '-score' ? sortVal : ''
    labSort.appendChild(spanSort)
    labSort.appendChild(sel)

    wrap.appendChild(labMin)
    wrap.appendChild(labSort)
    form.appendChild(wrap)

    form.addEventListener('submit', (e) => {
      try {
        const url = new URL(window.location.href)
        const params = new URLSearchParams()
        // collect all named fields from form
        const elems = Array.from(form.elements) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[]
        for (const el of elems) {
          const name = (el as any).name as string | undefined
          if (!name) continue
          const val = (el as any).value as string
          if (!val) continue
          // skip our UI helpers; we will map them
          if (name === 'minScoreUI' || name === 'sortScoreUI') continue
          params.set(name, val)
        }
        const minScore = (form.querySelector('input[name="minScoreUI"]') as HTMLInputElement | null)?.value?.trim() || ''
        const sortScore = (form.querySelector('select[name="sortScoreUI"]') as HTMLSelectElement | null)?.value || ''
        if (minScore) params.set('minScore', minScore)
        else params.delete('minScore')
        if (sortScore) params.set('sort', sortScore)
        else {
          // keep existing sort if not using score-param
          const prevSort = qs().get('sort')
          if (prevSort === 'score' || prevSort === '-score') params.delete('sort')
        }
        url.search = params.toString()
        e.preventDefault()
        history.replaceState(null, '', url.toString())
        window.location.reload()
      } catch {
        // let default submit proceed
      }
    })
    ;(form as any).__scoreControls = true
  }

  const getScoreFromRow = (row: HTMLElement): number | null => {
    // Try to read injected E-19 badge
    const badge = row.querySelector('[data-ui-audit-score]') as HTMLElement | null
    if (badge) {
      const b = badge.querySelector('b')
      const num = b ? Number((b.textContent || '').trim()) : NaN
      if (!Number.isNaN(num)) return num
    }
    const ds = (row as any).dataset?.score
    if (ds != null) {
      const n = Number(ds)
      if (!Number.isNaN(n)) return n
    }
    return null
  }

  const ensureRowScore = async (row: HTMLElement): Promise<number | null> => {
    const have = getScoreFromRow(row)
    if (have != null) return have
    // fetch on demand
    try {
      const slug = slugFromRow(row)
      if (!slug) return null
      const res = await fetch(`/api/ui-audit/score?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
      if (!res.ok) return null
      const json = (await res.json()) as ScoresResp
      const avg = typeof json?.scores?.average === 'number' ? json.scores.average : null
      if (avg != null) (row as any).dataset.score = String(avg)
      return avg
    } catch {
      return null
    }
  }

  const applyFilterAndSort = async () => {
    const rows = findRows()
    if (rows.length === 0) return
    const params = qs()
    const minScoreStr = params.get('minScore')
    const minScore = minScoreStr ? Number(minScoreStr) : null
    const sort = params.get('sort')

    const scores: Array<{ row: HTMLElement; score: number | null }> = []
    for (const row of rows) {
      const s = await ensureRowScore(row)
      scores.push({ row, score: s })
    }

    // filter by minScore
    if (minScore != null && !Number.isNaN(minScore)) {
      for (const { row, score } of scores) {
        if (typeof score === 'number' && score < minScore) (row as HTMLElement).style.display = 'none'
        else (row as HTMLElement).style.removeProperty('display')
      }
    }

    // sort by score if requested
    if (sort === 'score' || sort === '-score') {
      const cont = findListContainer()
      if (cont) {
        const arr = scores.slice()
        const cmp = (a: number | null, b: number | null, asc: boolean) => {
          const av = a == null ? -Infinity : a
          const bv = b == null ? -Infinity : b
          return asc ? av - bv : bv - av
        }
        arr.sort((A, B) => cmp(A.score, B.score, sort === '-score'))
        // re-append in order
        for (const { row } of arr) cont.appendChild(row)
      }
    }
  }

  const init = () => {
    ensureControls()
    // Execute after E-19 badge insertion; delay slightly
    setTimeout(() => { void applyFilterAndSort() }, 50)
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true })
  else init()
})()
// --- append-only: E-19 Add UI-Audit average score per page via API ---
;(() => {
  if (typeof window === 'undefined') return

  const color = (v: number) => (v >= 80 ? 'text-green-700' : v >= 50 ? 'text-amber-700' : 'text-rose-700')

  const findListRows = () => {
    const h1s = Array.from(document.querySelectorAll('h1')) as HTMLHeadingElement[]
    const h1 = h1s.find((n) => (n.textContent || '').trim() === 'Pages')
    const form = h1?.parentElement?.querySelector('form')
    // the list container follows the form
    const list = form?.nextElementSibling as HTMLElement | null
    if (!list) return [] as HTMLElement[]
    const rows = Array.from(list.querySelectorAll('div.grid')) as HTMLElement[]
    return rows
  }

  const getSlugFromRow = (row: HTMLElement) => {
    const firstCell = row.children.item(0) as HTMLElement | null
    const text = (firstCell?.textContent || '').trim()
    return text
  }

  const injectScore = (row: HTMLElement, score: number | null) => {
    const titleCell = (row.children.item(1) as HTMLElement) || row
    if (titleCell.querySelector('[data-ui-audit-score]')) return
    const span = document.createElement('span')
    span.setAttribute('data-ui-audit-score', '1')
    span.className = 'ml-3 text-xs'
    if (typeof score === 'number' && !Number.isNaN(score)) {
      const b = document.createElement('b')
      b.className = color(score)
      b.textContent = String(score)
      span.append('Score: ')
      span.appendChild(b)
    } else {
      span.textContent = 'Score: —'
    }
    titleCell.appendChild(span)
  }

  const loadScores = async () => {
    const rows = findListRows()
    await Promise.all(
      rows.map(async (row) => {
        try {
          const slug = getSlugFromRow(row)
          if (!slug) return injectScore(row, null)
          const res = await fetch(`/api/ui-audit/score?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
          if (!res.ok) return injectScore(row, null)
          const json = await res.json()
          const avg = typeof json?.scores?.average === 'number' ? json.scores.average : null
          injectScore(row, avg)
        } catch {
          injectScore(row, null)
        }
      })
    )
  }

  const init = () => { void loadScores() }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true })
  else init()
})()
