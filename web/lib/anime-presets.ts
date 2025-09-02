import type { AnimeParams } from 'animejs'
import type { AnimePresetKey } from '@/types/motion'

export const animePresets: Record<AnimePresetKey, (el: Element)=>AnimeParams> = {
  fadeIn: () => ({ opacity: [0, 1] }),
  fadeOut: () => ({ opacity: [1, 0] }),

  slideInUp: () => ({ translateY: [24, 0], opacity: [0, 1] }),
  slideInRight: () => ({ translateX: [24, 0], opacity: [0, 1] }),
  slideInDown: () => ({ translateY: [-24, 0], opacity: [0, 1] }),
  slideInLeft: () => ({ translateX: [-24, 0], opacity: [0, 1] }),

  scaleIn: () => ({ scale: [0.9, 1], opacity: [0, 1] }),
  scaleOut: () => ({ scale: [1, 0.9], opacity: [1, 0] }),

  rotateIn: () => ({ rotate: [-8, 0], opacity: [0, 1] }),
  rotateOut: () => ({ rotate: [0, 8], opacity: [1, 0] }),

  pulse: () => ({ scale: [{ value: 1.05, duration: 120 }, { value: 1, duration: 120 }] }),
  shake: () => ({ translateX: [{ value: -6, duration: 60 }, { value: 6, duration: 60 }, { value: 0, duration: 60 }] }),
}
