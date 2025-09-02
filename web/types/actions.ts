export type NodeTarget =
  | { type: 'nodeId'; value: string }
  | { type: 'css'; value: string }

export type AnimePresetKey =
  | 'fadeIn'
  | 'fadeOut'
  | 'slideInUp'
  | 'slideInRight'
  | 'slideInDown'
  | 'slideInLeft'
  | 'scaleIn'
  | 'scaleOut'
  | 'rotateIn'
  | 'rotateOut'
  | 'pulse'
  | 'shake'

export type OpenUrlAction = {
  type: 'openUrl'
  url: string
  target?: '_self' | '_blank'
}

export type NavigateAction = { type: 'navigate'; path: string }

export type ActionAnime = {
  type: 'anime'
  preset: AnimePresetKey
  options?: Partial<import('animejs').AnimationParams>
  target?: NodeTarget
}

export type Action = OpenUrlAction | NavigateAction | ActionAnime

export type ActionMap = { onClick?: Action[] }

export type ActionContext = { nodeId: string }
