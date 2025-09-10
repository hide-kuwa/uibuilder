export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function nextState(state: SaveState, event: string): SaveState {
  switch (state) {
    case 'idle':
      if (event === 'start') return 'saving'
      return state
    case 'saving':
      if (event === 'success') return 'saved'
      if (event === 'fail') return 'error'
      return state
    case 'saved':
      if (event === 'start') return 'saving'
      return state
    case 'error':
      if (event === 'reset') return 'idle'
      return state
    default:
      return state
  }
}

