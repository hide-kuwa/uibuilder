export type MotionEvent = 'click' | 'doubleClick' | 'mount' | 'inView'

export type NodeTarget =
  | { type: 'nodeId'; value: string }
  | { type: 'css'; value: string }

export type AnimePresetKey =
  | 'fadeIn' | 'fadeOut'
  | 'slideInUp' | 'slideInRight' | 'slideInDown' | 'slideInLeft'
  | 'scaleIn' | 'scaleOut'
  | 'rotateIn' | 'rotateOut'
  | 'pulse' | 'shake'

export type MotionEffect = {
  id: string
  preset: AnimePresetKey | string
  runWhen: MotionEvent[]
  target?: NodeTarget
  /** 0〜100（/dev/actions の簡易スライダで使う） */
  strength?: number
  /** 上書き用の生パラメータ（/dev/motion で詳細編集した結果） */
  options?: {
    duration?: number
    delay?: number
    easing?: string
    loop?: number | boolean
    direction?: 'normal' | 'reverse' | 'alternate'
    // ほか anime.js の値（translateX など）もここに入る想定
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [k: string]: any
  }
}
