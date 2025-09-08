// use client - append-only new client register
'use client'
import { useEffect } from 'react'

/**
 * Lineage パネルで直前に選択したノードを、スクロール後も一時的に再ハイライトする。
 * 取得キー候補：data-lineage-node-id / data-node-id（どちらかが付いていれば動作）
 * ハイライトは一時クラス __lineage-sticky-highlight を付与（自動で数秒後に除去）。
 */
export default function RegisterLineageStickyHighlightOnce() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    // 一度だけ
    if ((window as any).__lineageStickyInstalled) return
    ;(window as any).__lineageStickyInstalled = true

    // スタイルを追加（append-only）
    const style = document.createElement('style')
    style.setAttribute('data-lineage-sticky-style', '1')
    style.textContent = `
      .__lineage-sticky-highlight {
        outline: 2px solid rgba(99, 102, 241, 0.9); /* indigo-500 */
        outline-offset: 2px;
        border-radius: 6px;
        transition: outline-color .4s ease;
        background: rgba(99,102,241,.06);
      }
    `
    document.head.appendChild(style)

    let lastId: string | null = null
    let lastSel: HTMLElement | null = null
    let clearTimer: number | null = null

    const pickIdFrom = (el: HTMLElement | null): string | null => {
      while (el) {
        const ds: any = (el as any).dataset
        const a = ds?.lineageNodeId as string | undefined
        const b = ds?.nodeId as string | undefined
        if (a || b) return (a || b) as string
        el = el.parentElement
      }
      return null
    }

    const findElById = (id: string): HTMLElement | null => {
      return (
        (document.querySelector(
          `[data-lineage-node-id="${id}"]`
        ) as HTMLElement | null) ||
        (document.querySelector(
          `[data-node-id="${id}"]`
        ) as HTMLElement | null)
      )
    }

    const applySticky = () => {
      if (!lastId) return
      const el = findElById(lastId)
      if (!el) return
      if (lastSel && lastSel !== el) lastSel.classList.remove('__lineage-sticky-highlight')
      lastSel = el
      el.classList.add('__lineage-sticky-highlight')
      if (clearTimer) window.clearTimeout(clearTimer)
      clearTimer = window.setTimeout(() => {
        el.classList.remove('__lineage-sticky-highlight')
        clearTimer = null
      }, 1600)
    }

    // クリックで「最後に選択したID」を記憶（capture）
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      const id = pickIdFrom(target)
      if (id) lastId = id
    }

    // スクロール後に“粘着ハイライト”を再適用
    let scrollTimer: number | null = null
    const onScroll = () => {
      if (scrollTimer) window.clearTimeout(scrollTimer)
      scrollTimer = window.setTimeout(() => {
        applySticky()
        scrollTimer = null
      }, 120)
    }

    // Lineage ルート候補（見つからなければ document にぶら下げ）
    const lineageRoot =
      (document.querySelector('[data-lineage-root]') as HTMLElement | null) ||
      (document.querySelector('[data-panel="lineage"]') as HTMLElement | null) ||
      document

    document.addEventListener('click', onClick, true)
    lineageRoot.addEventListener('scroll', onScroll, { passive: true } as any)

    return () => {
      document.removeEventListener('click', onClick, true)
      lineageRoot.removeEventListener('scroll', onScroll as any)
      if (style.parentNode) style.parentNode.removeChild(style)
      if (clearTimer) window.clearTimeout(clearTimer)
    }
  }, [])
  return null
}

