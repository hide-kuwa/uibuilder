export type TokenRef = { $token: string }

export type Constraints = {
  horizontal: 'LEFT' | 'RIGHT' | 'CENTER' | 'SCALE'
  vertical: 'TOP' | 'BOTTOM' | 'CENTER' | 'SCALE'
}

export type Style = {
  fill?: TokenRef
  text?: TokenRef
  radius?: number
  opacity?: number
}

// --- Motion types (v0 stub) ---
export type MotionRef = { $motion: string }
export type MotionInline = {
  engine?: 'framer' | 'anime'
  preset?:
    | 'fadeIn'
    | 'fadeOut'
    | 'slideInUp'
    | 'slideInDown'
    | 'slideInLeft'
    | 'slideInRight'
    | 'scaleIn'
    | 'pop'
    | 'flipY'
    | 'staggerChildren'
  trigger?:
    | 'appear'
    | 'enter'
    | 'exit'
    | 'hover'
    | 'press'
    | 'focus'
    | 'loop'
    | 'scroll'
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

export type NodeBase = {
  id: string
  type:
    | 'FRAME'
    | 'STACK'
    | 'RECT'
    | 'TEXT'
    | 'IMAGE'
    | 'COMPONENT'
    | 'INSTANCE'
  name?: string
  visible?: boolean
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  constraints?: Constraints
  style?: Style
  motion?: MotionRef | MotionInline
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
  font?: {
    family: string
    size: number
    weight?: number
    lineHeight?: number
  }
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
}
