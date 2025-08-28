export type ApplyMode = 'replace' | 'append' | 'remove'
export type ApplyScope = 'selection' | 'all' | 'set-project-default'
export type PresetMsg = {
  type: 'apply'
  presetId: string
  mode: ApplyMode
  scope: ApplyScope
}

export function emitApply(
  presetId: string,
  mode: ApplyMode,
  scope: ApplyScope = 'selection',
) {
  const ch = new BroadcastChannel('action-presets')
  ch.postMessage({ type: 'apply', presetId, mode, scope } satisfies PresetMsg)
  ch.close()
}

export function subscribeApply(onMsg: (m: PresetMsg) => void) {
  const ch = new BroadcastChannel('action-presets')
  ch.onmessage = (ev) => {
    const m = ev.data as PresetMsg
    if (m?.type === 'apply') onMsg(m)
  }
  return () => ch.close()
}
