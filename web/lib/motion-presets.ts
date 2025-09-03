import type { AnimeParams } from 'animejs'
import type { AnimePresetKey } from '@/types/motion'

const clamp01 = (n: number) => Math.max(0, Math.min(1, n))
const norm = (strength = 50) => clamp01(strength / 100) // 0..1 に正規化
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export type MotionPresetDef = {
  key: AnimePresetKey | string
  name: string
  build: (s01: number) => AnimeParams
  defaults?: Pick<AnimeParams, 'duration' | 'easing'>
}

export const MOTION_PRESETS: Record<string, MotionPresetDef> = {
  fadeIn: {
    key: 'fadeIn',
    name: 'Fade in',
    build: (t) => ({
      opacity: [0, 1],
      translateY: [lerp(0, 8, t), 0], // 強度が高いほど浮上量が増える
    }),
    defaults: { duration: 280, easing: 'easeOutCubic' },
  },
  slideInUp: {
    key: 'slideInUp',
    name: 'Slide in up',
    build: (t) => ({
      translateY: [lerp(8, 64, t), 0],
      opacity: [0, 1],
    }),
    defaults: { duration: 320, easing: 'easeOutCubic' },
  },
  pulse: {
    key: 'pulse',
    name: 'Pulse',
    build: (t) => ({
      scale: [
        { value: lerp(1.02, 1.16, t), duration: 120 },
        { value: 1, duration: 120 },
      ],
    }),
    defaults: { duration: 240, easing: 'easeInOutQuad' },
  },
  shake: {
    key: 'shake',
    name: 'Shake',
    build: (t) => {
      const amp = lerp(4, 12, t)
      return {
        translateX: [
          { value: -amp, duration: 60 },
          { value: amp, duration: 60 },
          { value: 0, duration: 60 },
        ],
      }
    },
    defaults: { duration: 200, easing: 'linear' },
  },
  // 既存の scaleIn / rotateIn なども必要ならここに追加
}

export function buildAnimeParamsFromStrength(key: string, strength?: number): AnimeParams | undefined {
  const def = MOTION_PRESETS[key]
  if (!def) return
  const t = norm(strength ?? 50)
  const base = def.build(t)
  return { ...def.defaults, ...base }
}
