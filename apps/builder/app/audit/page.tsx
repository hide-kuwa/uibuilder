'use client'
import { useEffect, useState } from 'react'

type Item = { t: string } & Record<string, any>

export default function AuditPage() {
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const r = await fetch('/api/audit?limit=400', { cache: 'no-store' })
        const j = await r.json()
        if (alive && j?.ok) setItems(j.items)
      } catch {}
    }
    load()
    const id = setInterval(load, 2000)
    return () => { alive = false; clearInterval(id) }
  }, [])

  return (
    <div style={{ padding: 16 }}>
      <h1>Audit</h1>
      <p style={{ color: '#666' }}>Tail of /api/audit (auto-refresh)</p>
      <ol style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
        {items.map((it, i) => (<li key={i}>{JSON.stringify(it)}</li>))}
      </ol>
    </div>
  )
}

// --- append-only: Filter by op (inject UI above list, keep existing logic intact) ---
;(() => {
  if (typeof window === 'undefined') return
  let selectedOp = ''
  let selectEl: HTMLSelectElement | null = null
  let opsCache = new Set<string>()

  const findContext = () => {
    const h1s = Array.from(document.querySelectorAll('h1')) as HTMLHeadingElement[]
    const h1 = h1s.find((n) => (n.textContent || '').trim() === 'Audit')
    const container = h1?.closest('div') || document.body
    const list = container?.querySelector('ol') as HTMLOListElement | null
    return { container: container as HTMLElement | null, list }
  }

  const buildOps = (list: HTMLOListElement | null) => {
    const ops = new Set<string>()
    if (!list) return ops
    const items = Array.from(list.querySelectorAll('li')) as HTMLLIElement[]
    for (const li of items) {
      try {
        const txt = li.textContent || ''
        const obj = JSON.parse(txt)
        const op = typeof obj?.op === 'string' ? obj.op : undefined
        if (op) ops.add(op)
      } catch {}
    }
    return ops
  }

  const applyFilter = (list: HTMLOListElement | null) => {
    if (!list) return
    const items = Array.from(list.querySelectorAll('li')) as HTMLLIElement[]
    for (const li of items) {
      let show = true
      if (selectedOp) {
        try {
          const obj = JSON.parse(li.textContent || '{}')
          show = obj?.op === selectedOp
        } catch {
          show = false
        }
      }
      li.style.display = show ? '' : 'none'
    }
  }

  const renderSelect = (container: HTMLElement | null, list: HTMLOListElement | null) => {
    if (!container) return
    if (!selectEl) {
      const wrap = document.createElement('div')
      wrap.className = 'mb-2'
      const label = document.createElement('label')
      label.className = 'text-sm mr-2'
      label.textContent = 'Filter op:'
      selectEl = document.createElement('select')
      selectEl.className = 'border rounded px-2 py-1 text-sm'
      selectEl.addEventListener('change', (e) => {
        selectedOp = (e.target as HTMLSelectElement).value
        const { list } = findContext()
        applyFilter(list)
      })
      wrap.appendChild(label)
      wrap.appendChild(selectEl)
      const h1 = container.querySelector('h1')
      if (h1?.parentElement) {
        h1.parentElement.insertBefore(wrap, h1.nextSibling)
      } else {
        container.insertBefore(wrap, container.firstChild)
      }
    }
    // update options if needed
    const ops = buildOps(list)
    // Only update when changed to avoid resetting selection
    const isSame = ops.size === opsCache.size && Array.from(ops).every((o) => opsCache.has(o))
    if (!isSame && selectEl) {
      opsCache = ops
      const current = selectedOp
      selectEl.innerHTML = ''
      const optAll = document.createElement('option')
      optAll.value = ''
      optAll.textContent = 'All'
      selectEl.appendChild(optAll)
      Array.from(ops).sort().forEach((op) => {
        const opt = document.createElement('option')
        opt.value = op
        opt.textContent = op
        selectEl!.appendChild(opt)
      })
      selectEl.value = current
    }
  }

  const init = () => {
    const { container, list } = findContext()
    renderSelect(container, list)
    applyFilter(list)
  }

  const mo = new MutationObserver(() => {
    const { container, list } = findContext()
    renderSelect(container, list)
    applyFilter(list)
  })
  mo.observe(document.body, { childList: true, subtree: true })
  setTimeout(init, 0)
  setTimeout(init, 500)
})()

// --- append-only: E-25 UI-Audit summary block (top of page) ---
;(() => {
  if (typeof window === 'undefined') return

  type ScoreResp = { slug?: string; scores?: { average?: number }; issues?: Record<string, string[]> }

  const findRows = (): HTMLLIElement[] => {
    const list = document.querySelector('ol') as HTMLOListElement | null
    if (!list) return []
    return Array.from(list.querySelectorAll('li')) as HTMLLIElement[]
  }

  const parseSlug = (li: HTMLLIElement): string | null => {
    try {
      const obj = JSON.parse(li.textContent || '{}')
      const slug = (obj?.slug || obj?.id || obj?.page?.id) as string | undefined
      return slug || null
    } catch { return null }
  }

  const fetchScore = async (slug: string): Promise<ScoreResp | null> => {
    try {
      const res = await fetch(`/api/ui-audit/score?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
      if (!res.ok) return null
      return (await res.json()) as ScoreResp
    } catch { return null }
  }

  const cache = new Map<string, ScoreResp | null>() // slug -> response

  const ensureDataForSlugs = async (slugs: string[]) => {
    const uniq = Array.from(new Set(slugs))
    await Promise.all(
      uniq.map(async (s) => {
        if (!cache.has(s)) cache.set(s, await fetchScore(s))
      })
    )
  }

  const renderSummary = (rows: HTMLLIElement[]) => {
    // Aggregate over rows using cached data
    const rowScores: number[] = []
    const issueTotals: Record<string, number> = { contrast: 0, gridSpacing: 0, alignment: 0 }
    const perSlugTotalIssues = new Map<string, number>()
    const usedSlugs = new Set<string>()

    for (const li of rows) {
      const slug = parseSlug(li)
      if (!slug) continue
      const d = cache.get(slug) || null
      if (d && typeof d?.scores?.average === 'number') rowScores.push(d.scores.average)
      if (d && d.issues) {
        // count issues only once per slug (not per row) to avoid over-weighting
        if (!usedSlugs.has(slug)) {
          const c = Array.isArray(d.issues.contrast) ? d.issues.contrast.length : 0
          const g = Array.isArray((d.issues as any).gridSpacing) ? (d.issues as any).gridSpacing.length : 0
          const a = Array.isArray(d.issues.alignment) ? d.issues.alignment.length : 0
          issueTotals.contrast += c
          issueTotals.gridSpacing += g
          issueTotals.alignment += a
          perSlugTotalIssues.set(slug, c + g + a)
          usedSlugs.add(slug)
        }
      }
    }

    const count = rowScores.length
    const avg = count ? rowScores.reduce((s, v) => s + v, 0) / count : 0
    const below = rowScores.filter((v) => v < 50).length
    const belowPct = count ? Math.round((below / count) * 100) : 0

    // Top issues types
    const issuePairs = Object.entries(issueTotals).sort((a, b) => b[1] - a[1])
    const topIssues = issuePairs.slice(0, 3)

    // Top flagged pages by total issues
    const topPages = Array.from(perSlugTotalIssues.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3)

    const h1 = Array.from(document.querySelectorAll('h1')).find((n) => (n.textContent || '').trim() === 'Audit')
    const containerId = 'ui-audit-summary'
    let box = document.getElementById(containerId) as HTMLDivElement | null
    if (!box) {
      box = document.createElement('div')
      box.id = containerId
      box.className = 'mb-2 border rounded p-2 text-sm'
      if (h1?.parentElement) h1.parentElement.insertBefore(box, h1.nextSibling)
    }
    if (!box) return

    const issueLabel = (k: string) => (k === 'gridSpacing' ? 'spacing' : k)

    const rowsHtml = topPages
      .map(([slug, n]) => `<div class="flex items-center justify-between">
        <a class="underline text-blue-600 hover:text-blue-800" href="/dev/pages?tag=${encodeURIComponent(slug)}">${slug}</a>
        <span class="font-mono text-xs">${n}</span>
      </div>`)
      .join('')

    box.innerHTML = `
      <div class="font-semibold">UI-Audit Summary (current logs)</div>
      <div class="grid grid-cols-2 gap-2 mt-1">
        <div class="border rounded p-2">
          <div class="text-xs opacity-70">Average Score</div>
          <div class="text-lg font-semibold">${avg.toFixed(1)}</div>
          <div class="text-xs text-gray-600">n=${count}</div>
        </div>
        <div class="border rounded p-2">
          <div class="text-xs opacity-70">Below 50</div>
          <div class="text-lg font-semibold">${belowPct}%</div>
          <div class="text-xs text-gray-600">${below} / ${count}</div>
        </div>
        <div class="border rounded p-2 col-span-2">
          <div class="text-xs opacity-70">Top Issues</div>
          <div class="text-xs">
            ${topIssues.map(([k, v]) => `<span class="mr-3">${issueLabel(k)}: <b>${v}</b></span>`).join('') || '<span class="opacity-60">n/a</span>'}
          </div>
        </div>
        <div class="border rounded p-2 col-span-2">
          <div class="text-xs opacity-70">Most flagged pages</div>
          <div class="space-y-1">${rowsHtml || '<span class="text-xs text-gray-500">n/a</span>'}</div>
        </div>
      </div>
    `
  }

  let scheduled = false
  const recompute = async () => {
    if (scheduled) return
    scheduled = true
    setTimeout(async () => {
      scheduled = false
      const rows = findRows()
      const slugs = rows.map(parseSlug).filter((s): s is string => !!s)
      await ensureDataForSlugs(slugs)
      renderSummary(rows)
    }, 80)
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { void recompute() }, { once: true })
  else void recompute()
  const mo = new MutationObserver(() => { void recompute() })
  mo.observe(document.body, { childList: true, subtree: true })
})()

// --- append-only: E-24 Add "→ Pages" jump on low-score rows (<50) ---
;(() => {
  if (typeof window === 'undefined') return

  type ScoresResp = { scores?: { average?: number } }

  const parseSlug = (li: HTMLLIElement) => {
    try {
      const obj = JSON.parse(li.textContent || '{}')
      const slug = (obj?.slug || obj?.id || obj?.page?.id) as string | undefined
      return slug || null
    } catch { return null }
  }

  const fetchScore = async (slug: string): Promise<number | null> => {
    try {
      const res = await fetch(`/api/ui-audit/score?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
      if (!res.ok) return null
      const json = (await res.json()) as ScoresResp
      return typeof json?.scores?.average === 'number' ? json.scores.average : null
    } catch { return null }
  }

  const ensureJump = (li: HTMLLIElement, slug: string) => {
    if (li.querySelector('[data-pages-jump]')) return
    const btn = document.createElement('button')
    btn.setAttribute('data-pages-jump', '1')
    btn.type = 'button'
    btn.className = 'ml-2 text-[11px] underline text-blue-600 hover:text-blue-800'
    btn.textContent = '→ Pages'
    btn.addEventListener('click', () => {
      const url = `/dev/pages?tag=${encodeURIComponent(slug)}&minScore=50`
      window.location.href = url
    })
    // place near badges if present; else append to end
    const host = li.querySelector('[data-audit-badges]')
    if (host && host.nextSibling) li.insertBefore(btn, host.nextSibling)
    else li.appendChild(btn)
  }

  const applyOnce = async () => {
    const list = document.querySelector('ol') as HTMLOListElement | null
    if (!list) return
    const rows = Array.from(list.querySelectorAll('li')) as HTMLLIElement[]
    const cache = new Map<string, number | null>()
    for (const li of rows) {
      const slug = parseSlug(li)
      if (!slug) continue
      let sc = cache.get(slug) ?? null
      if (!cache.has(slug)) {
        sc = await fetchScore(slug)
        cache.set(slug, sc)
      }
      if (typeof sc === 'number' && sc < 50) {
        ensureJump(li, slug)
      }
    }
  }

  const schedule = () => { void applyOnce() }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true })
  else schedule()
  const mo = new MutationObserver(() => schedule())
  mo.observe(document.body, { childList: true, subtree: true })
})()

// --- append-only: E-23 Min Score filter (API-based, non-destructive) ---
;(() => {
  if (typeof window === 'undefined') return

  type ScoresResp = { scores?: { average?: number } }

  const qs = () => new URLSearchParams(window.location.search)

  const injectControls = () => {
    const h1 = Array.from(document.querySelectorAll('h1')).find((n) => (n.textContent || '').trim() === 'Audit')
    if (!h1) return null as HTMLElement | null
    const exists = h1.parentElement?.querySelector('[data-minscore-controls]') as HTMLElement | null
    if (exists) return exists
    const box = document.createElement('div')
    box.setAttribute('data-minscore-controls', '1')
    box.className = 'mb-2 flex items-center gap-2'
    const label = document.createElement('label')
    label.className = 'text-sm mr-2'
    label.textContent = 'Min Score:'
    const input = document.createElement('input')
    input.type = 'number'
    input.name = 'minScoreUI'
    input.className = 'border rounded px-2 py-1 text-sm w-[90px]'
    input.placeholder = 'e.g. 70'
    const apply = document.createElement('button')
    apply.type = 'button'
    apply.className = 'px-2 py-1 border rounded text-sm'
    apply.textContent = 'Apply'
    // initial value from query
    const v = qs().get('minScore') || ''
    if (v) input.value = v
    apply.addEventListener('click', () => {
      try {
        const url = new URL(window.location.href)
        const p = new URLSearchParams(url.search)
        const val = input.value.trim()
        if (val) p.set('minScore', val)
        else p.delete('minScore')
        url.search = p.toString()
        history.replaceState(null, '', url.toString())
        window.location.reload()
      } catch {
        /* noop */
      }
    })
    box.appendChild(label)
    box.appendChild(input)
    box.appendChild(apply)
    if (h1.parentElement) h1.parentElement.insertBefore(box, h1.nextSibling)
    return box
  }

  const parseSlug = (li: HTMLLIElement) => {
    try {
      const obj = JSON.parse(li.textContent || '{}')
      const slug = (obj?.slug || obj?.id || obj?.page?.id) as string | undefined
      return slug || null
    } catch { return null }
  }

  const fetchScore = async (slug: string): Promise<number | null> => {
    try {
      const res = await fetch(`/api/ui-audit/score?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
      if (!res.ok) return null
      const json = (await res.json()) as ScoresResp
      return typeof json?.scores?.average === 'number' ? json.scores.average : null
    } catch { return null }
  }

  const applyFilter = async () => {
    const minScoreStr = qs().get('minScore')
    const threshold = minScoreStr ? Number(minScoreStr) : null
    if (threshold == null || Number.isNaN(threshold)) return
    const list = document.querySelector('ol') as HTMLOListElement | null
    if (!list) return
    const rows = Array.from(list.querySelectorAll('li')) as HTMLLIElement[]
    const cache = new Map<string, number | null>()
    for (const li of rows) {
      const slug = parseSlug(li)
      if (!slug) continue
      let sc = cache.get(slug) ?? null
      if (!cache.has(slug)) {
        sc = await fetchScore(slug)
        cache.set(slug, sc)
      }
      if (typeof sc === 'number' && sc < threshold) {
        li.style.display = 'none'
      }
    }
  }

  const init = () => {
    injectControls()
    void applyFilter()
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true })
  else init()

  const mo = new MutationObserver(() => { void applyFilter() })
  mo.observe(document.body, { childList: true, subtree: true })
})()

// --- append-only: E-22 Highlight low-score logs (average < 50) with warning ---
;(() => {
  if (typeof window === 'undefined') return

  type ScoresResp = { scores?: { average?: number } }

  const parseRow = (li: HTMLLIElement) => {
    try {
      const obj = JSON.parse(li.textContent || '{}')
      const slug = (obj?.slug || obj?.id || obj?.page?.id) as string | undefined
      return { slug }
    } catch {
      return { slug: undefined }
    }
  }

  const fetchScore = async (slug: string): Promise<number | null> => {
    try {
      const res = await fetch(`/api/ui-audit/score?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
      if (!res.ok) return null
      const json = (await res.json()) as ScoresResp
      const avg = typeof json?.scores?.average === 'number' ? json.scores.average : null
      return avg
    } catch { return null }
  }

  const applyOnce = async () => {
    const list = document.querySelector('ol') as HTMLOListElement | null
    if (!list) return
    const rows = Array.from(list.querySelectorAll('li')) as HTMLLIElement[]
    const cache = new Map<string, number | null>() // slug -> score
    for (const li of rows) {
      if ((li as any).__lowScoreMarked) continue
      const { slug } = parseRow(li)
      if (!slug) continue
      let sc = cache.get(slug) ?? null
      if (!cache.has(slug)) {
        sc = await fetchScore(slug)
        cache.set(slug, sc)
      }
      if (typeof sc === 'number' && sc < 50) {
        li.classList.add('border', 'rounded', 'bg-rose-50', 'border-rose-300', 'text-rose-700')
        // prepend small warning icon
        if (!li.querySelector('[data-low-score-icon]')) {
          const ico = document.createElement('span')
          ico.setAttribute('data-low-score-icon', '1')
          ico.className = 'mr-1 text-[10px]'
          ico.textContent = '⚠️'
          li.insertBefore(ico, li.firstChild)
        }
        ;(li as any).__lowScoreMarked = true
      }
    }
  }

  const schedule = () => { void applyOnce() }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true })
  else schedule()
  const mo = new MutationObserver(() => schedule())
  mo.observe(document.body, { childList: true, subtree: true })
})()

// --- append-only: E-21 Add UI-Audit score badges per contentHash (API-based) ---
;(() => {
  if (typeof window === 'undefined') return

  type ScoresResp = { slug?: string; scores?: { average?: number } }

  const color = (v: number) => (v >= 80 ? 'text-green-700' : v >= 50 ? 'text-amber-700' : 'text-rose-700')

  const parseRow = (li: HTMLLIElement) => {
    try {
      const obj = JSON.parse(li.textContent || '{}')
      const contentHash = obj?.contentHash as string | undefined
      const slug = (obj?.slug || obj?.id || obj?.page?.id) as string | undefined
      return { contentHash, slug }
    } catch {
      return { contentHash: undefined, slug: undefined }
    }
  }

  const ensureBadge = (li: HTMLLIElement, score: number | null) => {
    if (li.querySelector('[data-ui-audit-score-badge]')) return
    if (score == null || Number.isNaN(score)) return
    const span = document.createElement('span')
    span.setAttribute('data-ui-audit-score-badge', '1')
    span.className = `ml-2 text-[10px] font-semibold ${color(score)}`
    span.title = 'UI-Audit average score'
    span.textContent = `Score: ${Math.round(score)}`
    // Prefer to place next to our shadow badges host if present
    const host = li.querySelector('[data-audit-badges]')
    if (host && host.nextSibling) li.insertBefore(span, host.nextSibling)
    else li.appendChild(span)
  }

  const fetchScore = async (slug: string): Promise<number | null> => {
    try {
      const res = await fetch(`/api/ui-audit/score?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
      if (!res.ok) return null
      const json = (await res.json()) as ScoresResp
      const avg = typeof json?.scores?.average === 'number' ? json.scores.average : null
      return avg
    } catch {
      return null
    }
  }

  const applyOnce = async () => {
    const list = document.querySelector('ol') as HTMLOListElement | null
    if (!list) return
    const rows = Array.from(list.querySelectorAll('li')) as HTMLLIElement[]
    const cache = new Map<string, number | null>() // slug -> score
    for (const li of rows) {
      const { contentHash, slug } = parseRow(li)
      if (!contentHash || !slug) continue
      let sc = cache.get(slug) ?? null
      if (!cache.has(slug)) {
        sc = await fetchScore(slug)
        cache.set(slug, sc)
      }
      ensureBadge(li, sc)
    }
  }

  const schedule = () => { void applyOnce() }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true })
  else schedule()
  const mo = new MutationObserver(() => schedule())
  mo.observe(document.body, { childList: true, subtree: true })
})()

// --- append-only: Highlight related rows by op or contentHash on click ---
;(() => {
  if (typeof window === 'undefined') return
  type Kind = 'op' | 'hash' | ''
  let selectedKind: Kind = ''
  let selectedValue = ''

  const findContext = () => {
    const h1s = Array.from(document.querySelectorAll('h1')) as HTMLHeadingElement[]
    const h1 = h1s.find((n) => (n.textContent || '').trim() === 'Audit')
    const container = h1?.closest('div') || document.body
    const list = container?.querySelector('ol') as HTMLOListElement | null
    return { container: container as HTMLElement | null, list, h1: h1 || null }
  }

  const renderHint = () => {
    const { container, h1 } = findContext()
    if (!container || !h1) return
    let hint = container.querySelector('[data-audit-hl-hint]') as HTMLElement | null
    if (!selectedKind) { if (hint) hint.remove(); return }
    const text = selectedKind === 'op' ? `Highlighting op: ${selectedValue}` : `Highlighting contentHash: ${selectedValue}`
    if (!hint) {
      hint = document.createElement('div')
      hint.setAttribute('data-audit-hl-hint', '1')
      hint.className = 'text-sm italic text-gray-500'
      if (h1.parentElement) h1.parentElement.insertBefore(hint, h1.nextSibling)
      else container.insertBefore(hint, container.firstChild)
    }
    hint.textContent = text
  }

  const applyHighlight = () => {
    const { list } = findContext()
    if (!list) return
    const rows = Array.from(list.querySelectorAll('li')) as HTMLLIElement[]
    rows.forEach((li) => {
      const op = (li as any).dataset?.op || ''
      const hash = (li as any).dataset?.hash || ''
      const match = selectedKind === 'op' ? op === selectedValue : selectedKind === 'hash' ? hash === selectedValue : false
      li.classList.toggle('bg-yellow-100', !!selectedKind && match)
      li.classList.toggle('border-yellow-300', !!selectedKind && match)
      if (!!selectedKind && match) {
        li.classList.remove('border-gray-200')
      }
    })
    renderHint()
  }

  const ensureAnnotated = (li: HTMLLIElement) => {
    if ((li as any).__auditAnno) return
    let obj: any = null
    try { obj = JSON.parse(li.textContent || '{}') } catch { obj = null }
    const op = typeof obj?.op === 'string' ? obj.op : ''
    const hash = typeof obj?.contentHash === 'string' ? obj.contentHash : ''
    if (op) li.dataset.op = op
    if (hash) li.dataset.hash = hash

    // Inject a shadow-based badge host so li.textContent stays as raw JSON
    const host = document.createElement('span')
    host.setAttribute('data-audit-badges', '1')
    host.style.position = 'relative'
    host.style.display = 'inline-block'
    // no text nodes in light DOM
    li.appendChild(host)
    const shadow = host.attachShadow({ mode: 'open' })
    const makeBadge = (label: string, value: string, kind: Kind) => {
      const btn = document.createElement('button')
      btn.part.add('badge')
      btn.textContent = `${label}: ${value || '-'}`
      btn.style.fontSize = '10px'
      btn.style.marginLeft = '8px'
      btn.style.textDecoration = 'underline'
      btn.style.color = '#2563eb' // blue-600
      btn.style.background = 'transparent'
      btn.style.border = 'none'
      btn.style.cursor = 'pointer'
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        if (!value) return
        if (selectedKind === kind && selectedValue === value) {
          selectedKind = ''
          selectedValue = ''
        } else {
          selectedKind = kind
          selectedValue = value
        }
        applyHighlight()
      })
      return btn
    }
    const style = document.createElement('style')
    style.textContent = `:host{all:initial} button{all:unset} button{font:inherit} button{}`
    shadow.appendChild(style)
    const wrap = document.createElement('span')
    wrap.style.marginLeft = '6px'
    if (op) wrap.appendChild(makeBadge('op', op, 'op'))
    if (hash) wrap.appendChild(makeBadge('contentHash', hash, 'hash'))
    shadow.appendChild(wrap)

    ;(li as any).__auditAnno = true
  }

  const tick = () => {
    const { list } = findContext()
    if (!list) return
    const rows = Array.from(list.querySelectorAll('li')) as HTMLLIElement[]
    rows.forEach(ensureAnnotated)
    applyHighlight()
  }

  const mo = new MutationObserver(tick)
  mo.observe(document.body, { childList: true, subtree: true })
  tick()
})()

// --- append-only: Filter by contentHash via ?hash=... and show hint under title ---
;(() => {
  if (typeof window === 'undefined') return
  const getHash = () => new URLSearchParams(window.location.search).get('hash') ?? ''
  let currentHash = getHash()

  const findContext = () => {
    const h1s = Array.from(document.querySelectorAll('h1')) as HTMLHeadingElement[]
    const h1 = h1s.find((n) => (n.textContent || '').trim() === 'Audit')
    const container = h1?.closest('div') || document.body
    const list = container?.querySelector('ol') as HTMLOListElement | null
    return { container: container as HTMLElement | null, list, h1: h1 || null }
  }

  const renderHashHint = (container: HTMLElement | null, h1: HTMLHeadingElement | null, hash: string) => {
    if (!container || !h1) return
    // remove prior hint if hash cleared
    const prev = container.querySelector('[data-audit-hash-hint]')
    if (!hash) { if (prev) prev.remove(); return }
    if (prev) { prev.querySelector('strong')!.textContent = hash; return }
    const p = document.createElement('p')
    p.setAttribute('data-audit-hash-hint', '1')
    p.className = 'text-xs text-gray-500'
    const strong = document.createElement('strong')
    strong.textContent = hash
    p.append('Filtered by contentHash: ')
    p.appendChild(strong)
    if (h1.parentElement) h1.parentElement.insertBefore(p, h1.nextSibling)
    else container.insertBefore(p, container.firstChild)
  }

  const applyHashFilter = (list: HTMLOListElement | null, hash: string) => {
    if (!list) return
    const items = Array.from(list.querySelectorAll('li')) as HTMLLIElement[]
    for (const li of items) {
      // Only hide additional rows that don't match the hash; don't force-show to respect other filters
      if (!hash) continue
      try {
        const obj = JSON.parse(li.textContent || '{}')
        const match = obj?.contentHash === hash
        if (!match) li.style.display = 'none'
      } catch {
        li.style.display = 'none'
      }
    }
  }

  const tick = () => {
    const hash = getHash()
    const { container, list, h1 } = findContext()
    renderHashHint(container, h1, hash)
    applyHashFilter(list, hash)
    currentHash = hash
  }

  // Observe DOM changes and URL param changes (basic polling for SPA nav)
  const mo = new MutationObserver(tick)
  mo.observe(document.body, { childList: true, subtree: true })
  tick()
  setInterval(() => {
    const h = getHash(); if (h !== currentHash) tick()
  }, 500)
})()
