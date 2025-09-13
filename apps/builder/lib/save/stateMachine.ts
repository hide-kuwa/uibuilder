export type SaveState = 'idle' | 'queued' | 'offline' | 'flushing' | 'saved'

export function nextState(state: SaveState, event: string): SaveState {
  switch (state) {
    case 'idle':
      if (event === 'enqueue') return 'queued'
      return state
    case 'queued':
      if (event === 'offline') return 'offline'
      if (event === 'flush') return 'flushing'
      return state
    case 'offline':
      if (event === 'reconnect') return 'flushing'
      return state
    case 'flushing':
      if (event === 'done') return 'saved'
      if (event === 'offline') return 'offline'
      if (event === 'fail') return 'queued'
      return state
    case 'saved':
      if (event === 'enqueue') return 'queued'
      if (event === 'change') return 'idle'
      return state
    default:
      return state
  }
}