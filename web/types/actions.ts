export type OpenUrlAction = { type: 'openUrl'; url: string; target?: '_self' | '_blank' }
export type NavigateAction = { type: 'navigate'; path: string }
export type Action = OpenUrlAction | NavigateAction
export type ActionMap = { onClick?: Action[] }
export type ActionContext = { nodeId: string }
