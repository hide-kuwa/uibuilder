import type { AnimationParams } from 'animejs'
import type { AnimePresetKey } from '@/types/motion'

const clamp01 = (n: number) => Math.max(0, Math.min(1, n))
const norm = (strength = 50) => clamp01(strength / 100) // 0..1 に正規化
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export type MotionPresetDef = {
  key: AnimePresetKey | string
  name: string
  build: (s01: number) => AnimationParams
  defaults?: Pick<AnimationParams, 'duration' | 'easing'>
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
  // 1) 弾む（その場で上下に減衰バウンス）
  bounce: {
    key: 'bounce',
    name: 'Bounce',
    build: (t) => {
      const amp = lerp(6, 24, t) // 揺れ幅
      return {
        translateY: [
          { value: -amp * 3, duration: 220, easing: 'easeOutCubic' },
          { value: 0, duration: 180, easing: 'easeInCubic' },
          { value: -amp * 1.5, duration: 160, easing: 'easeOutCubic' },
          { value: 0, duration: 140, easing: 'easeInCubic' },
          { value: -amp * 0.75, duration: 120, easing: 'easeOutCubic' },
          { value: 0, duration: 100, easing: 'easeInCubic' },
        ],
      }
    },
    defaults: { duration: 920, easing: 'linear' },
  },

  // 2) バウンド（上から落下→床で数回バウンド）
  groundBounce: {
    key: 'groundBounce',
    name: 'Ground bounce',
    build: (t) => {
      const drop = lerp(40, 180, t) // 落下距離（大きいほど上から）
      const amp = lerp(10, 40, t) // 床でのバウンド振幅
      return {
        translateY: [
          { value: [-drop, 0], duration: lerp(300, 600, t), easing: 'easeInQuad' }, // 落下
          { value: -amp * 0.6, duration: 200, easing: 'easeOutQuad' }, // 1st up
          { value: 0, duration: 160, easing: 'easeInQuad' }, // 1st down
          { value: -amp * 0.3, duration: 140, easing: 'easeOutQuad' }, // 2nd up
          { value: 0, duration: 120, easing: 'easeInQuad' }, // 2nd down
          { value: -amp * 0.15, duration: 120, easing: 'easeOutQuad' }, // 3rd
          { value: 0, duration: 100, easing: 'easeInQuad' },
        ],
      }
    },
    defaults: { duration: 1240, easing: 'linear' },
  },

  // 3) パスに沿って移動（SVG path を指定して移動）
  //    options.pathSelector に CSS セレクタを渡してください
  followPath: {
    key: 'followPath',
    name: 'Follow path',
    build: (t) => ({
      // runMotion 側で pathSelector があれば translateX/Y を path に置き換えます
      translateX: 'path:x',
      translateY: 'path:y',
      // duration は強度でスピード変化（強いほど速い）
      duration: Math.round(lerp(1800, 600, t)),
      easing: 'linear',
    }),
    defaults: {} as any,
  },

  // 弧を描いて拡大しつつフェード
  arcZoomFade: {
    key: 'arcZoomFade',
    name: 'Arc zoom fade',
    build: (t) => {
      const dx = lerp(60, 220, t) // 水平移動距離
      const peak = lerp(24, 80, t) // 弧の高さ
      return {
        translateX: [
          { value: dx * 0.5, duration: 260, easing: 'easeOutCubic' },
          { value: dx,       duration: 260, easing: 'easeInCubic'  },
        ],
        translateY: [
          { value: -peak,    duration: 260, easing: 'easeOutCubic' },
          { value: 0,        duration: 260, easing: 'easeInCubic'  },
        ],
        scale: [
          { value: 1.08, duration: 260, easing: 'easeOutQuad' },
          { value: 1.0,  duration: 260, easing: 'easeInQuad'  },
        ],
        opacity: [
          { value: [0, 1], duration: 200, easing: 'linear' },
          { value: 1, duration: 200 },
        ],
      }
    },
    defaults: { duration: 520, easing: 'linear' },
  },

  // カード束がシャッフル（コンテナ配下の .card が対象）
  cardShuffle: {
    key: 'cardShuffle',
    name: 'Card shuffle',
    build: (t) => {
      const dist = lerp(16, 56, t)
      const rot = lerp(3, 10, t)
      const delay = lerp(40, 90, t)
      return {
        // runMotion 側で nestedTargetsSelector を使って el.querySelectorAll('.card') をターゲットに
        nestedTargetsSelector: '.card' as any,
        translateX: (el: Element, i: number) => [
          { value: (i % 2 ? dist : -dist), duration: 180 },
          { value: 0, duration: 180 },
        ] as any,
        rotate: (el: Element, i: number) => [
          { value: (i % 2 ? -rot : rot), duration: 180 },
          { value: 0, duration: 180 },
        ] as any,
        delay: (_: Element, i: number) => i * delay,
        easing: 'easeInOutQuad',
      } as any
    },
    defaults: { duration: 420, easing: 'easeInOutQuad' },
  },
  // 既存の scaleIn / rotateIn なども必要ならここに追加
}

export function buildAnimeParamsFromStrength(key: string, strength?: number): AnimationParams | undefined {
  const def = MOTION_PRESETS[key]
  if (!def) return
  const t = norm(strength ?? 50)
  const base = def.build(t)
  return { ...def.defaults, ...base }
}
