// apps/builder/components/rightpane/DsTestPanelPlus.tsx
'use client'
import { useState } from 'react'
import { auditPost } from '@/src/lib/audit'

export default function DsTestPanelPlus() {
  const [url, setUrl] = useState('')
  const [timeoutMs, setTimeoutMs] = useState(8000)
  const [retries, setRetries] = useState(1)
  const [backoffMs, setBackoffMs] = useState(400)
  const [out, setOut] = useState('')

  const post = async () => {
    setOut('loading…')
    try {
      // append-only: POST audit for DS v2 invocation
      auditPost('ds.fetch.v2', { url, timeoutMs, retries, backoffMs })
      const res = await fetch('/api/ds-fetch3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, opts: { timeoutMs, retries, backoffMs } }),
      })
      const json = await res.json()
      setOut(JSON.stringify(json, null, 2))
    } catch (e: any) {
      setOut(String(e?.message || e))
    }
  }

  return (
    <div style={{ padding: 12 }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <input
          placeholder="https://example.com/data.json"
          value={url}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.currentTarget.value)}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <label>timeoutMs <input type="number" value={timeoutMs} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTimeoutMs(Number(e.currentTarget.value))} style={{ width: 120 }} /></label>
          <label>retries <input type="number" value={retries} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRetries(Number(e.currentTarget.value))} style={{ width: 120 }} /></label>
          <label>backoffMs <input type="number" value={backoffMs} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBackoffMs(Number(e.currentTarget.value))} style={{ width: 120 }} /></label>
        </div>
        <button onClick={post}>POST /api/ds-fetch3</button>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, background: '#fafafa', border: '1px solid #eee', padding: 8, maxHeight: 300, overflow: 'auto' }}>
          {out}
        </pre>
      </div>
    </div>
  )
}

// --- append-only: DS+ UX enhancements (no edits to existing lines) ---
(() => {
  if (typeof window === 'undefined') return
  const w = window as any
  if (w.__dsplus_enhanced) return
  w.__dsplus_enhanced = true

  let dsBtn: HTMLButtonElement | null = null
  let dsPre: HTMLPreElement | null = null
  let errDiv: HTMLDivElement | null = null
  let abortCtrl: AbortController | null = null
  let loading = false

  const setLoading = (v: boolean) => {
    loading = v
    if (dsBtn) {
      dsBtn.disabled = v
      dsBtn.classList.toggle('opacity-60', v)
      dsBtn.classList.toggle('pointer-events-none', v)
    }
  }

  const ensureNodes = () => {
    if (!dsBtn) {
      // Find the DS+ action button by its label
      const btns = Array.from(document.querySelectorAll('button')) as HTMLButtonElement[]
      dsBtn = btns.find((b) => (b.textContent || '').includes('POST /api/ds-fetch3')) || null
      if (dsBtn && !(dsBtn as any).__dsplus_bound) {
        dsBtn.addEventListener(
          'click',
          (ev) => {
            // Prevent double-run
            if (loading) { ev.stopPropagation(); ev.preventDefault(); return }
            // Abort previous run if any
            if (abortCtrl) { try { abortCtrl.abort() } catch {}
              abortCtrl = null
            }
            hideError()
            setLoading(true)
          },
          true
        )
        ;(dsBtn as any).__dsplus_bound = true
      }
    }
    if (!dsPre) {
      // Prefer a <pre> within the same section
      const scope = dsBtn?.closest('div') ?? document
      dsPre = (scope.querySelector('pre') as HTMLPreElement) || null
      if (dsPre && !(dsPre.parentElement as any).__dsplus_copy_injected) {
        // Make parent relative to position the copy button
        dsPre.parentElement?.classList?.add('relative')
        const copyBtn = document.createElement('button')
        copyBtn.textContent = 'Copy'
        copyBtn.className = 'absolute top-1 right-2 text-[10px] underline text-blue-600 hover:text-blue-800'
        copyBtn.addEventListener('click', () => {
          try { navigator.clipboard.writeText(dsPre?.innerText || '') } catch {}
        })
        dsPre.parentElement?.appendChild(copyBtn)
        ;(dsPre.parentElement as any).__dsplus_copy_injected = true
      }
    }
    if (!errDiv && dsPre) {
      errDiv = document.createElement('div')
      errDiv.setAttribute('role', 'alert')
      errDiv.setAttribute('aria-live', 'polite')
      errDiv.className = 'relative hidden rounded border border-rose-300 bg-rose-100 p-2 text-xs text-rose-800 whitespace-pre-wrap break-all'
      const strong = document.createElement('strong')
      strong.className = 'block font-semibold'
      strong.textContent = 'Error'
      const text = document.createElement('div')
      text.className = 'mt-1'
      errDiv.appendChild(strong)
      errDiv.appendChild(text)
      // Copy button on error box
      const cpy = document.createElement('button')
      cpy.textContent = 'Copy'
      cpy.className = 'absolute top-1 right-2 text-[10px] underline text-blue-600 hover:text-blue-800'
      cpy.addEventListener('click', () => {
        try { navigator.clipboard.writeText(text.textContent || '') } catch {}
      })
      errDiv.appendChild(cpy)
      dsPre.parentElement?.insertBefore(errDiv, dsPre)
    }
  }

  const showError = (msg: string) => {
    ensureNodes()
    if (!errDiv || !dsPre) return
    const text = errDiv.querySelector('div.mt-1') as HTMLDivElement | null
    if (text) text.textContent = msg
    errDiv.classList.remove('hidden')
    dsPre.style.display = 'none'
  }
  const hideError = () => {
    if (!errDiv || !dsPre) return
    errDiv.classList.add('hidden')
    dsPre.style.removeProperty('display')
  }

  const isTarget = (input: any) => {
    try {
      if (typeof input === 'string') return input.includes('/api/ds-fetch3')
      if (input && typeof input === 'object' && 'url' in input) return String((input as Request).url).includes('/api/ds-fetch3')
    } catch {}
    return false
  }

  const origFetch = window.fetch.bind(window)
  window.fetch = (async (input: RequestInfo, init?: RequestInit) => {
    if (!isTarget(input)) return origFetch(input as any, init as any)

    ensureNodes()
    // Inject AbortController if none present
    const nextInit: RequestInit = { ...(init || {}) }
    if (!nextInit.signal) {
      abortCtrl = new AbortController()
      nextInit.signal = abortCtrl.signal
    }
    try {
      const res = await origFetch(input as any, nextInit)
      if (!res.ok) {
        let message = `HTTP ${res.status}`
        try {
          const ct = res.headers.get('content-type') || ''
          if (ct.includes('application/json')) {
            const data = await res.clone().json().catch(() => null as any)
            const guess = (data && (data.message || data.error || data.detail)) || ''
            if (guess) message += `\n${String(guess)}`
          } else {
            const t = await res.clone().text().catch(() => '')
            if (t) message += `\n${t.slice(0, 1000)}`
          }
        } catch {}
        showError(message)
        throw new Error(message)
      } else {
        hideError()
      }
      return res
    } finally {
      setLoading(false)
      abortCtrl = null
    }
  }) as any

  // Try to capture nodes after mount
  const tryBind = () => { ensureNodes() }
  const mo = new MutationObserver(tryBind)
  mo.observe(document.documentElement, { subtree: true, childList: true })
  setTimeout(tryBind, 0)
  setTimeout(tryBind, 300)
  setTimeout(tryBind, 800)
})()
