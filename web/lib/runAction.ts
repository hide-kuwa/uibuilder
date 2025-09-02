'use client'
import { animate, utils, type AnimationParams } from 'animejs'
import type { Action } from '@/types/actions'
import { animePresets } from '@/lib/anime-presets'

const resolveTarget = (action: Action, fallbackEl?: HTMLElement | null) => {
  // NodeId で NodeWrapper を掴む想定（div[data-node-id]）
  if (action.type === 'anime' && action.target) {
    if (action.target.type === 'css') return document.querySelector(action.target.value) as HTMLElement | null
    if (action.target.type === 'nodeId') return document.querySelector<HTMLElement>(`[data-node-id="${action.target.value}"]`)
  }
  return fallbackEl ?? null
}

export function runAction(action: Action, ctx?: { currentEl?: HTMLElement | null }) {
  if (action.type === 'openUrl') {
    window.open(action.url, '_blank', 'noopener,noreferrer')
    return
  }
  if (action.type === 'anime') {
    if (typeof window === 'undefined') return
    const el = resolveTarget(action, ctx?.currentEl)
    if (!el) return
    const base: AnimationParams = {
      duration: 300,
      easing: 'easeInOutQuad',
      autoplay: true,
    }
    const preset = animePresets[action.preset]?.(el) ?? {}
    utils.remove(el) // 前のアニメをクリア
    animate(el, { ...base, ...preset, ...(action.options || {}) })
  }
}
