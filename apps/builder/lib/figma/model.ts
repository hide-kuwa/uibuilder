export type TokenRef = { $token: string }

export type Style = { fill?: TokenRef; text?: TokenRef; radius?: number; opacity?: number }

// --- Motion types (v0 stub) ---
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

export type Constraints = Record<string, unknown>

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
  motion?: MotionRef | MotionInline
}

export type Node = NodeBase & {
  children?: Node[]
  text?: string
}

export type Page = { id: string; name: string; root: Node }

export type Document = { pages: Page[] }

export type RectPatch = Partial<Pick<NodeBase, 'x' | 'y' | 'width' | 'height'>>

export function findNode(root: Node, id: string): Node | null {
  if (root.id === id) return root
  if (root.children) {
    for (const child of root.children) {
      const found = findNode(child, id)
      if (found) return found
    }
  }
  return null
}
