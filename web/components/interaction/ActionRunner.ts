'use client'
import { Interaction } from '@/lib/interaction/types'

export function actionsEnabled(): boolean {
  if (typeof document === 'undefined') return false
  const root = document.querySelector('[data-actions-enabled="true"]')
  return !!root
}

export async function runInteraction(it: Interaction): Promise<void> {
  if (!actionsEnabled() || !it) return
  if (it.type === 'openUrl') {
    const t = it.target || '_blank'
    window.open(it.url, t)
    return
  }
  if (it.type === 'navigate') {
    try {
      const mod = await import('@/store/pageStore')
      const hasFn = typeof (mod as any).usePageStore?.getState === 'function' &&
                    typeof (mod as any).usePageStore.getState().setCurrentPageId === 'function'
      if (hasFn) {
        ;(mod as any).usePageStore.getState().setCurrentPageId(it.pageId, {
          transition: it.transition || 'instant',
          durationMs: it.durationMs ?? 200
        })
        return
      }
    } catch {}
    const url = new URL(typeof window !== 'undefined' ? window.location.href : '/', window.location.origin)
    url.searchParams.set('page', it.pageId)
    window.location.assign(url.toString())
    return
  }
  if (it.type === 'scrollTo') {
    const el = document.querySelector(`[data-node-id="${it.targetNodeId}"]`) as HTMLElement | null
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: it.behavior || 'smooth', block: it.block || 'start' })
    }
    return
  }
  if (it.type === 'openModal') {
    const mod = await import('@/store/modalStore')
    ;(mod as any).useModalStore.getState().openWith(it.contentNodeId)
    return
  }
  if (it.type === 'closeModal') {
    const mod = await import('@/store/modalStore')
    ;(mod as any).useModalStore.getState().close()
    return
  }
}
