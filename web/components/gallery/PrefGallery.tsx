'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import ScrollingRibbon from './ScrollingRibbon'
import type { PrefName } from '@/lib/prefectures'
import { listPrefImages, downloadFileBlob, ensureAuth } from '@/lib/google-drive'

function usePrefObjectUrls(pref: PrefName, limit = 40) {
  const [urls, setUrls] = useState<string[]>([])
  const abortRef = useRef(false)

  useEffect(() => {
    abortRef.current = false
    let revoke: string[] = []
    ;(async () => {
      try {
        await ensureAuth()
        const files = await listPrefImages(pref)
        const pick = files.slice(0, limit)
        const out: string[] = []
        // 取りすぎると重いので直列/軽い並列にする
        for (const f of pick) {
          if (abortRef.current) break
          const blob = await downloadFileBlob(f.id)
          const url = URL.createObjectURL(blob)
          revoke.push(url)
          out.push(url)
          if (abortRef.current) break
          setUrls([...out]) // 漸進表示
        }
      } catch (e) {
        console.error('[usePrefObjectUrls]', e)
        setUrls([])
      }
    })()
    return () => {
      abortRef.current = true
      revoke.forEach(u => URL.revokeObjectURL(u))
    }
  }, [pref, limit])

  return urls
}

export default function PrefGallery({ pref }: { pref: PrefName }) {
  const urls = usePrefObjectUrls(pref, 60)
  const half = Math.ceil(urls.length / 2) || 1
  const top = useMemo(() => urls.slice(0, half), [urls, half])
  const bottom = useMemo(() => urls.slice(half), [urls, half])

  return (
    <div className="space-y-3">
      <ScrollingRibbon images={top} direction="left" durationSec={40} height={160} />
      <ScrollingRibbon images={bottom.length ? bottom : top} direction="right" durationSec={36} height={160} />
    </div>
  )
}
