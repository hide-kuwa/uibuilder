export type NodeTarget =
  | { type: 'nodeId'; value: string }
  | { type: 'css'; value: string }

export type MotionEvent = 'click' | 'doubleClick' | 'mount' | 'inView'

export type AnimePresetKey =
  | 'fadeIn' | 'fadeOut'
  | 'slideInUp' | 'slideInRight' | 'slideInDown' | 'slideInLeft'
  | 'scaleIn' | 'scaleOut'
  | 'rotateIn' | 'rotateOut'
  | 'pulse' | 'shake'

export type MotionEffect = {
  id: string
  preset: AnimePresetKey
  runWhen: MotionEvent[]            // いつ走らせるか
  target?: NodeTarget               // 未指定なら currentEl / 選択ノード
  ifJson?: any                      // 既存UIの If(JSON logic) と合わせるなら
  throttle?: number                 // ms
  debounce?: number                 // ms
  options?: {
    duration?: number
    delay?: number
    easing?: string
    loop?: number | boolean
    direction?: 'normal' | 'reverse' | 'alternate'
  }
}
