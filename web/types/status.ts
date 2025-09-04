export type BaseStatus = 'visited' | 'living' | 'notVisited'
export type OverlayStatus = 'want' | 'hasPhoto'
export type AnyStatus = BaseStatus | OverlayStatus

export type StatusStyle = {
  /** カードの背景色（例: #3b82f6） */
  color: string
  /** ベース常時エフェクト（mount 等） */
  motionPreset?: string
  motionStrength?: number
  /** ホバー時のエフェクト */
  hoverPreset?: string
  hoverStrength?: number
}

/** グローバルの初期（ちゃぴおすすめ） */
export const DEFAULT_STATUS_CONFIG: Record<AnyStatus, StatusStyle> = {
  visited:   { color: '#3b82f6', motionPreset: 'fadeIn',     motionStrength: 40, hoverPreset: 'pulse', hoverStrength: 40 },
  living:    { color: '#22c55e', motionPreset: 'slideInUp',  motionStrength: 35, hoverPreset: 'pulse', hoverStrength: 35 },
  notVisited:{ color: '#d1d5db', motionPreset: undefined,    motionStrength: 0,  hoverPreset: 'pulse', hoverStrength: 20 },
  want:      { color: '#eab308', motionPreset: undefined,    motionStrength: 0,  hoverPreset: 'bounce', hoverStrength: 40 },
  hasPhoto:  { color: '#8b5cf6', motionPreset: undefined,    motionStrength: 0,  hoverPreset: 'shake',  hoverStrength: 30 },
}

/** ノードに保存する状態 */
export type NodeStatusState = {
  base: BaseStatus
  overlays: OverlayStatus[] // 例: ['want','hasPhoto']
}
