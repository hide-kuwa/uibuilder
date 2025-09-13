export type TokenRef = { $token: string }

export type Constraints = {
  horizontal: 'LEFT' | 'RIGHT' | 'CENTER' | 'SCALE'
  vertical: 'TOP' | 'BOTTOM' | 'CENTER' | 'SCALE'
}

export type GradientFill = {
  type: 'linear' | 'radial'
  stops: { offset: number; color: string }[]
  angle?: number
}

export type Shadow = { x: number; y: number; blur: number; spread: number; color: string }

export type CornerRadius = number | { tl: number; tr: number; br: number; bl: number }

export type NodeStyle = {
  fill?: string | GradientFill
  stroke?: string
  strokeWidth?: number
  radius?: CornerRadius
  opacity?: number
  shadow?: Shadow | string
  shadows?: Shadow[]
  mixBlendMode?: React.CSSProperties['mixBlendMode']
  filter?: string
  backdropFilter?: string
  rotateDeg?: number
  scaleX?: number
  scaleY?: number
  skewXDeg?: number
  skewYDeg?: number
  backgroundImage?: string
  backgroundSize?: string
  backgroundPosition?: string
}

export type TransitionDef = {
  property: string
  durationMs: number
  easing?: string
  delayMs?: number
}

export type NodeMotion = {
  transition?: TransitionDef[]
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
  style?: NodeStyle
  motion?: NodeMotion
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
