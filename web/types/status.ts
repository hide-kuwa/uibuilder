export type BaseStatus = 'visited' | 'resident' | 'notVisited'
export type Overlay = 'want' | 'hasPhotos'

export type MotionPresetId =
  | 'pulse-glow'
  | 'bounce'
  | 'float'
  | 'trail'
  | 'arc-zoom-fade'
  | 'shuffle-cards'
  | 'none'

export type NodeStatus = {
  base: BaseStatus
  overlays: Overlay[]
}

export type StatusVisual = {
  color: string
  effects: MotionPresetId[]
}

export type OverlayRule = StatusVisual & {
  priority: number
  mode: 'blend' | 'override' | 'glow'
}

export type StatusConfig = {
  base: Record<BaseStatus, StatusVisual>
  overlay: Record<Overlay, OverlayRule>
  compose: {
    colorMode: 'blend' | 'override'
    order: 'priority' | 'fixed'
  }
}

export const defaultStatusConfig: StatusConfig = {
  base: {
    visited:   { color: '#2563eb', effects: ['none'] },
    resident:  { color: '#16a34a', effects: ['float'] },
    notVisited:{ color: '#9ca3af', effects: ['none'] },
  },
  overlay: {
    want:      { color: '#f59e0b', effects: ['pulse-glow'], priority: 10, mode: 'glow' },
    hasPhotos: { color: '#111827', effects: ['trail'],      priority: 5,  mode: 'blend' },
  },
  compose: { colorMode: 'blend', order: 'priority' }
}

// backward-compatible aliases
export type OverlayStatus = Overlay
export type AnyStatus = BaseStatus | Overlay | 'hasPhoto'
export type StatusStyle = StatusVisual
export type NodeStatusState = NodeStatus
export const DEFAULT_STATUS_CONFIG: Record<AnyStatus, StatusStyle> = {
  visited: defaultStatusConfig.base.visited,
  living: defaultStatusConfig.base.resident,
  resident: defaultStatusConfig.base.resident,
  notVisited: defaultStatusConfig.base.notVisited,
  want: defaultStatusConfig.overlay.want,
  hasPhoto: defaultStatusConfig.overlay.hasPhotos,
  hasPhotos: defaultStatusConfig.overlay.hasPhotos,
}
