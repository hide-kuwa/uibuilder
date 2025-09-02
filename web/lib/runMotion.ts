'use client'
import { animate, utils, type AnimationParams } from 'animejs'
import { animePresets } from '@/lib/anime-presets'
import type { MotionEffect, MotionEvent, NodeTarget } from '@/types/motion'

const resolveTarget = (target: NodeTarget | undefined, fallback: HTMLElement | null) => {
  if (!target) return fallback
  if (target.type === 'css') return document.querySelector(target.value) as HTMLElement | null
  if (target.type === 'nodeId') return document.querySelector<HTMLElement>(`[data-node-id="${target.value}"]`)
  return fallback
}

export function runMotionEffects(
  effects: MotionEffect[] | undefined,
  when: MotionEvent,
  fallbackEl: HTMLElement | null
) {
  if (!effects?.length) return
  for (const eff of effects) {
    if (!eff.runWhen?.includes(when)) continue
    const el = resolveTarget(eff.target, fallbackEl)
    if (!el) continue

    const base: AnimationParams = {
      duration: 300,
      easing: 'easeInOutQuad',
      autoplay: true,
    }
    const preset = animePresets[eff.preset]?.(el) ?? {}
    const opts = eff.options ?? {}
    utils.remove(el)
    animate(el, { ...base, ...preset, ...opts })
  }
}
