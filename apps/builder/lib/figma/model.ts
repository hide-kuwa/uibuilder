// Token reference supports both legacy `$token` and new `token/fallback` forms
export type TokenRef = { $token: string } | { token: string; fallback?: string }

export type Constraints = {
  horizontal: 'LEFT' | 'RIGHT' | 'CENTER' | 'SCALE'
  vertical: 'TOP' | 'BOTTOM' | 'CENTER' | 'SCALE'
}

export type CornerValue = number | TokenRef
export type CornerRadius = { tl: CornerValue; tr: CornerValue; br: CornerValue; bl: CornerValue }
export type Style = {
  // Existing tokens/props
  fill?: TokenRef | string
  text?: TokenRef
  radius?: number | TokenRef | CornerRadius
  opacity?: number
  // Extended optional style fields (safe additive)
  stroke?: string
  strokeWidth?: number
  shadow?: { x: number; y: number; blur: number; spread: number; color: string }
  shadows?: { x: number; y: number; blur: number; spread: number; color: string }[]
}

export type MotionRef = { $motion: string }
export type MotionInline = {
  engine?: 'framer' | 'anime'
  preset?: 'fadeIn' | 'fadeOut' | 'slideInUp' | 'slideInDown' | 'slideInLeft' | 'slideInRight' | 'scaleIn' | 'pop' | 'flipY' | 'staggerChildren'
  trigger?: 'appear' | 'enter' | 'exit' | 'hover' | 'press' | 'focus' | 'loop' | 'scroll'
  options?: {
    duration?: number | { $token: string }
    delay?: number | { $token: string }
    easeToken?: { $token: string }
    distance?: number | { $token: string }
    direction?: 'up' | 'down' | 'left' | 'right'
    repeat?: number | 'infinite'
    staggerStep?: number | { $token: string }
    disabledOnReducedMotion?: boolean
  }
}

export type ThemePreset = {
  id: string
  name: string
  tokens: Record<string, string>
}

export type NodeBase = {
  id: string
  type: 'FRAME' | 'STACK' | 'RECT' | 'TEXT' | 'IMAGE' | 'COMPONENT' | 'INSTANCE'
  name?: string
  visible?: boolean
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  constraints?: Constraints
  style?: Style
  // Allow simple CSS transition fields in addition to existing motion types
  motion?: MotionRef | MotionInline | { durationMs?: number; delayMs?: number; easing?: string } | { transition?: { property: string; durationMs?: number; delayMs?: number; easing?: string }[] }
}

export type Stack = NodeBase & {
  type: 'STACK'
  direction: 'H' | 'V'
  spacing: number
  padding: { t: number; r: number; b: number; l: number }
  align: 'START' | 'CENTER' | 'END' | 'SPACE_BETWEEN'
  children: Node[]
}

export type Text = NodeBase & {
  type: 'TEXT'
  content: string
  font?: { family: string; size: number; weight?: number; lineHeight?: number }
}

export type Frame = NodeBase & { type: 'FRAME'; children: Node[] }
export type Rect = NodeBase & { type: 'RECT' }
export type Image = NodeBase & { type: 'IMAGE'; src?: string }

export type Node = Frame | Stack | Text | Rect | Image | NodeBase

export type Page = { id: string; name: string; root: Frame }

export type Document = {
  id: string
  name: string
  pages: Page[]
  tokens?: Record<string, string | number>
  themePresets?: ThemePreset[]
  activeThemeId?: string
}
