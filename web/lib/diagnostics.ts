export const DIAGNOSTICS_EVENT_NAME = 'builder:diag-update'

const DISABLED_VALUES = ['0', 'false', 'off']

export function isDiagnosticsEnabled() {
  if (process.env.NODE_ENV === 'production') return false
  const flag = process.env.NEXT_PUBLIC_BUILDER_DIAGNOSTICS
  if (!flag) return true
  const normalized = flag.trim().toLowerCase()
  return !DISABLED_VALUES.includes(normalized)
}
