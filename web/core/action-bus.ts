export type Action = { type: string; payload?: any }
type Handler = (a: Action) => void
const listeners = new Set<Handler>()
export const dispatch = (a: Action) => { listeners.forEach(h => h(a)) }
export const subscribe = (h: Handler) => (listeners.add(h), () => listeners.delete(h))
export const ActionBus = { dispatch, subscribe }
export default ActionBus
