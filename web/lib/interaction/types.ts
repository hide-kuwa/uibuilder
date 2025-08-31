export type TransitionKind = 'instant' | 'dissolve' | 'slide'

export type InteractionNavigate = {
  type: 'navigate'
  pageId: string
  transition?: TransitionKind
  durationMs?: number
}

export type InteractionOpenUrl = {
  type: 'openUrl'
  url: string
  target?: '_self' | '_blank'
}

export type InteractionScrollTo = {
  type: 'scrollTo'
  targetNodeId: string
  behavior?: 'auto' | 'smooth'
  block?: 'start' | 'center' | 'end' | 'nearest'
}

export type InteractionOpenModal = {
  type: 'openModal'
  contentNodeId: string
}

export type InteractionCloseModal = {
  type: 'closeModal'
}

export type Interaction =
  | InteractionNavigate
  | InteractionOpenUrl
  | InteractionScrollTo
  | InteractionOpenModal
  | InteractionCloseModal

export type ElementInteractions = {
  onClick?: Interaction | null
}
