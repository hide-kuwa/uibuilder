'use client'
import { Action, ActionContext } from '@/types/actions'
import { useRouter } from 'next/navigation'
import React from 'react'
import { usePreviewNavStore } from '@/store/previewNavStore'

export function useActionRunner() {
  const router = useRouter()
  return React.useCallback(async (actions: Action[] | undefined, ctx: ActionContext) => {
    if (!actions || actions.length === 0) return
    const gate = document.querySelector('[data-actions-enabled="true"]')
    if (!gate) return
    for (const a of actions) {
      if (a.type === 'openUrl') {
        const t = a.target || '_self'
        if (t === '_blank') window.open(a.url, '_blank', 'noopener,noreferrer')
        else location.assign(a.url)
      } else if (a.type === 'navigate') {
        if (a.path.startsWith('#page:')) {
          const pid = a.path.slice('#page:'.length)
          usePreviewNavStore.getState().goTo(pid)
        } else {
          router.push(a.path)
        }
      }
    }
  }, [router])
}
