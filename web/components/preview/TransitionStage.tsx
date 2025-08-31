'use client'
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePreviewNavStore } from '@/store/previewNavStore'

export function TransitionStage({ pageId, children }: { pageId: string | '__single__'; children: React.ReactNode }) {
  const kind = usePreviewNavStore(s=>s.defaultTransition)
  const dur = usePreviewNavStore(s=>s.durationMs)
  const dir = usePreviewNavStore(s=>s.direction)
  if (kind === 'instant') {
    return <div className="w-full h-full">{children}</div>
  }
  const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
  const slide = {
    initial: { x: dir > 0 ? 32 : -32, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: dir > 0 ? -32 : 32, opacity: 0 },
  }
  const v = kind === 'fade' ? fade : slide
  return (
    <div className="w-full h-full relative overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.div key={pageId} initial={v.initial} animate={v.animate} exit={v.exit} transition={{ duration: dur / 1000 }} className="w-full h-full absolute inset-0">
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
