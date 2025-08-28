export type ApplyMode = 'replace'|'append'|'remove'
export type ApplyScope = 'selection'|'all'|'set-project-default'
export type PresetMsg = { type:'apply'; presetId:string; mode:ApplyMode; scope:ApplyScope }

const hasBC = () => typeof window !== 'undefined' && 'BroadcastChannel' in window

export function emitApply(presetId: string, mode: ApplyMode, scope: ApplyScope = 'selection') {
  const msg: PresetMsg = { type:'apply', presetId, mode, scope }
  if (hasBC()) {
    const ch = new BroadcastChannel('action-presets'); ch.postMessage(msg); ch.close()
  } else if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<PresetMsg>('ap-apply', { detail: msg }))
  }
}

export function subscribeApply(onMsg:(m:PresetMsg)=>void) {
  if (hasBC()) {
    const ch = new BroadcastChannel('action-presets')
    ch.onmessage = (ev) => { const m = ev.data as PresetMsg; if (m?.type==='apply') onMsg(m) }
    return () => ch.close()
  }
  const h = (e: Event) => {
    const ce = e as CustomEvent<PresetMsg>
    if (ce.detail?.type === 'apply') onMsg(ce.detail)
  }
  window.addEventListener('ap-apply', h as EventListener)
  return () => window.removeEventListener('ap-apply', h as EventListener)
}
