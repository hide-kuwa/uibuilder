import { useDevLogStore } from '@/store/devLogStore'

let installed = false
export function installConsoleInterceptor() {
  if (installed) return
  installed = true
  const orig = { log: console.log, warn: console.warn, error: console.error }
  console.log = (...args: any[]) => { try { useDevLogStore.getState().add({ level:'log', msg: args.join(' ') }) } catch {} ; orig.log.apply(console, args) }
  console.warn = (...args: any[]) => { try { useDevLogStore.getState().add({ level:'warn', msg: args.join(' ') }) } catch {} ; orig.warn.apply(console, args) }
  console.error = (...args: any[]) => { try { useDevLogStore.getState().add({ level:'error', msg: args.join(' ') }) } catch {} ; orig.error.apply(console, args) }
}

