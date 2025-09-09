// apps/builder/lib/save/applyAndSave.ts
import { useSaveStore } from '@/stores/saveQueue'
import { debounce } from '@/lib/utils/debounce'
import React from 'react'
import ReactDOM from 'react-dom'
import ChangeGate from '@/components/common/ChangeGate'

async function getScore(slug: string): Promise<number | null> {
  try {
    const r = await fetch(`/api/ui-audit/score?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
    const j = await r.json()
    return typeof j?.scores?.average === 'number' ? j.scores.average : null
  } catch { return null }
}

function showGate(score: number): Promise<{ ok: boolean; reason?: string }> {
  return new Promise((resolve) => {
    const host = document.createElement('div')
    const done = (ok: boolean, reason?: string) => {
      try { ReactDOM.unmountComponentAtNode(host) } catch {}
      host.remove()
      resolve({ ok, reason })
    }
    document.body.appendChild(host)
    ReactDOM.render(
      React.createElement(ChangeGate, {
        score,
        onConfirm: (reason: string) => done(true, reason),
        onCancel: () => done(false),
      }),
      host
    )
  })
}

export const saveDebounced = debounce(async (slug: string, draft: any) => {
  try {
    // Gate if score < 70
    const score = await getScore(slug)
    if (score != null && score < 70) {
      const { ok, reason } = await showGate(score)
      if (!ok) return
      if (draft && typeof draft === 'object') {
        ;(draft as any).__gate = { gateBypass: true, reason, scoreAtSave: score }
      }
      try { await fetch('/api/audit-log', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ op: 'gateBypass', slug, score, reason, at: new Date().toISOString() }) }) } catch {}
    }
    await useSaveStore.getState().queueChange(slug, draft)
  } catch {}
}, 1000)
