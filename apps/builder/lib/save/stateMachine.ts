export type SaveState = 'idle' | 'queued' | 'offline' | 'flushing' | 'saved'
export type SaveEvent = 'enqueue' | 'offline' | 'reconnect' | 'done'

export function nextState(state: SaveState, event: SaveEvent): SaveState {
  switch (state) {
    case 'idle':
      if (event === 'enqueue') return 'queued'
      return state
    case 'queued':
      if (event === 'offline') return 'offline'
      return state
    case 'offline':
      if (event === 'reconnect') return 'flushing'
      return state
    case 'flushing':
      if (event === 'done') return 'saved'
      return state
    case 'saved':
      if (event === 'enqueue') return 'queued'
      return state
  }
}

