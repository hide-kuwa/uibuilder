'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { decodeShare } from '@/lib/share'
import { useBuilderStore } from '@/store/builderStore'
import { NodeRendererCompat } from '@/components/NodeRendererCompat'
import { usePreviewNavStore } from '@/store/previewNavStore'
import PreviewNavBar from '@/components/preview/PreviewNavBar'
import { TransitionStage } from '@/components/preview/TransitionStage'

function pickInitialPageId(els: any[]): string | null {
  const withPid = els.filter((e:any)=>e.pageId)
  if (withPid.length) return String(withPid[0].pageId)
  return '__single__'
}
function elementsForPage(els: any[], pid: string | null): any[] {
  if (!pid || pid === '__single__') return els.filter((e:any)=>!e.parentId)
  return els.filter((e:any)=>e.pageId === pid && !e.parentId)
}

export default function PreviewPage() {
  const [ready, setReady] = useState(false)
  const elements = useBuilderStore(s=>s.elements)
  const init = usePreviewNavStore(s=>s.init)
  const current = usePreviewNavStore(s=>s.currentPageId)

  useEffect(() => {
    const p = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
    const d = p.get('d')
    if (d) {
      const data = decodeShare(d)
      if (data?.elements) {
        useBuilderStore.setState({ elements: data.elements, meta: data.meta ?? {} })
        init(pickInitialPageId(data.elements as any[]))
      } else {
        init(pickInitialPageId(useBuilderStore.getState().elements as any[]))
      }
    } else {
      init(pickInitialPageId(useBuilderStore.getState().elements as any[]))
    }
    setReady(true)
  }, [init])

  const roots = useMemo(()=>elementsForPage(elements as any[], current), [elements, current])

  if (!ready) return null
  const stageKey = current ?? '__single__'
  return (
    <div data-actions-enabled="true" suppressHydrationWarning className="w-full h-screen relative bg-black">
      <PreviewNavBar />
      <TransitionStage pageId={stageKey}>
        <div className="w-full h-full relative">
          {roots.map((n:any)=> <NodeRendererCompat key={String(n.id)} node={n} />)}
        </div>
      </TransitionStage>
    </div>
  )
}
