'use client'
import React from 'react'
import { useGuideStore } from '@/stores/guideStore'
import DiffPreview from '@/components/common/DiffPreview'
import type { AuditIssue } from '@/lib/audit/types'
import { applyContrastFix, applyFontVarietyFix, applyGrid8Fix, applyAlignmentFix, applyA11yHeadingFix } from '@/lib/guide/actions'
import { toUnifiedDiff } from '@/lib/guide/diff'
import { useSaveStore } from '@/stores/saveQueue'
import { saveDebounced } from '@/lib/save/applyAndSave'
import { logEvent } from '@/lib/utils/telemetry'

async function loadTree(slug: string): Promise<any | null> {
  try {
    const res = await fetch(`/pages/${encodeURIComponent(slug)}.json`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    if (Array.isArray(data?.tree)) return data.tree
    if (Array.isArray(data)) return data
    return null
  } catch {
    return null
  }
}

export default function GuidePanel({ slug: initSlug, onApply }: { slug?: string; onApply?: (next: any, ctx: { issue: AuditIssue }) => void }) {
  const { issues, loading, selected, load, select, applyResult, clearResult, setApplyResult } = useGuideStore()
  const [slug, setSlug] = React.useState<string>(initSlug || '')
  const [busy, setBusy] = React.useState(false)
  const [score, setScore] = React.useState<number | null>(null)
  const saveStore = useSaveStore()

  React.useEffect(() => {
    const s = initSlug || new URLSearchParams(window.location.search).get('slug') || 'sample'
    setSlug(s)
    load(s)
    ;(async () => {
      try {
        const r = await fetch(`/api/ui-audit/score?slug=${encodeURIComponent(s)}`, { cache: 'no-store' })
        const j = await r.json()
        setScore(typeof j?.scores?.average === 'number' ? j.scores.average : null)
      } catch {}
    })()
  }, [initSlug, load])

  const run = async (iss: AuditIssue) => {
    setBusy(true)
    try {
      const tree = await loadTree(iss.slug || slug)
      if (!tree) return
      let next = tree
      switch (iss.kind) {
        case 'contrast':
          next = applyContrastFix(tree, iss)
          break
        case 'fontVariety':
          next = applyFontVarietyFix(tree)
          break
        case 'grid8':
          next = applyGrid8Fix(tree)
          break
        case 'alignment':
          next = applyAlignmentFix(tree)
          break
        case 'a11yHeading':
          next = applyA11yHeadingFix(tree)
          break
      }
      const beforeStr = JSON.stringify(tree, null, 2)
      const afterStr = JSON.stringify(next, null, 2)
      const diffText = toUnifiedDiff(`${iss.slug}.json`, beforeStr, afterStr)
      setApplyResult({ before: tree, after: next, diffText })
      logEvent('guideApply', { slug: iss.slug, kind: iss.kind, nodeId: iss.nodeId })
      // Attempt to draft-apply
      try {
        if (onApply) onApply(next, { issue: iss })
        // route all saves through saveDebounced (gate統一)
        const ID_OK = /^[a-zA-Z0-9_-]+$/
        const sid = ID_OK.test(iss.slug) ? iss.slug : 'page'
        await saveDebounced(sid, next)
        // optional global hook fallback
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any
        if (typeof w?.__builderDraftApply === 'function') w.__builderDraftApply(iss.slug, next)
      } catch {}
      // refresh score
      try {
        const r2 = await fetch(`/api/ui-audit/score?slug=${encodeURIComponent(iss.slug)}`, { cache: 'no-store' })
        const j2 = await r2.json()
        setScore(typeof j2?.scores?.average === 'number' ? j2.scores.average : null)
      } catch {}
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 p-2 text-sm">
      <div className="flex items-center gap-2">
        <b>Guide</b>
        <span className="opacity-70">Issues: {issues.length}</span>
        <span className="opacity-60 ml-2">Score:</span>
        <span data-testid="score-badge" data-score={score == null ? '' : String(Math.round(score))} className={`font-semibold ${score == null ? 'opacity-50' : ''}`}>{score == null ? '—' : Math.round(score)}</span>
        <span className="ml-auto opacity-60">slug:</span>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          onBlur={() => load(slug)}
          className="border rounded px-2 py-0.5 text-xs w-40"
        />
      </div>
      {loading ? <div className="text-xs text-gray-600">Loading issues…</div> : null}
      <ul className="space-y-2 max-h-64 overflow-auto">
        {issues.map((i) => (
          <li key={i.id} className={`p-2 rounded border ${selected === i.id ? 'border-blue-400' : 'border-gray-200'}`}>
            <div className="font-medium text-xs">{i.kind} — <span className="opacity-70">#{i.nodeId}</span></div>
            <div className="text-[11px] opacity-70">{i.message}</div>
            <div className="mt-2 flex gap-2">
              <button data-testid="guide-contrast-apply" disabled={busy} className={`underline ${busy ? 'opacity-60 pointer-events-none' : ''}`} onClick={() => run(i)}>修正</button>
              <button className="underline text-gray-600" onClick={() => select(i.id)}>選択</button>
            </div>
          </li>
        ))}
      </ul>
      {applyResult && (
        <div className="mt-2" data-testid="diff-modal">
          <div className="text-sm mb-1">差分プレビュー</div>
          <DiffPreview before={applyResult.diffText?.split('@@\n-')[1]?.split('\n+')[0]} after={applyResult.diffText?.split('\n+')[1]} />
          <div className="mt-2 flex items-center gap-2">
            <button data-testid="diff-approve" className="underline" onClick={() => navigator.clipboard.writeText(applyResult.diffText || '')}>Copy .diff</button>
            <button className="underline text-gray-600" onClick={clearResult}>クリア</button>
          </div>
        </div>
      )}
    </div>
  )
}
