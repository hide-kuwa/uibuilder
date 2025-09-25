"use client";

import type { InsertAPI } from '@/lib/bridge/insert'

export const insertNode: InsertAPI = (parentId, index, node) => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent('builder.insertNode', {
      detail: { parentId, index, node },
    }),
  )
}
