'use client'
export const dynamic = 'force-dynamic'
import React, { useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { usePageStore } from '@/store/pageStore'
import { NodeRendererCompat } from '@/components/NodeRendererCompat'
import TokenStyle from '@/components/theme/TokenStyle'
import { mountLiveSync } from '@/store/liveSync'

export default function PreviewByPageId() {
  const { pageId } = useParams<{ pageId: string }>()
  const page = usePageStore((s) => s.pages.find((p) => p.id === pageId))
  const elements = page?.tree || []

  useEffect(() => {
    mountLiveSync('preview')
  }, [])

  const roots = useMemo(() => (elements as any[]).filter((e: any) => !e.parentId), [elements])

  if (!page) return <div className="p-4">Page not found</div>

  return (
    <>
      <TokenStyle />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full h-screen relative bg-black"
      >
        {roots.map((n: any) => (
          <NodeRendererCompat key={String(n.id)} node={n} />
        ))}
      </motion.div>
    </>
  )
}
