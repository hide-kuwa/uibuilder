export const ENABLE_DYNAMIC_ELM_IMPORT = false
export const ENABLE_UNIFIED_PREVIEW = true

const envFlags = {
  glowOff: process.env.NEXT_PUBLIC_FLAG_GLOWOFF === 'true',
  heavyAnimationOff:
    process.env.NEXT_PUBLIC_FLAG_HEAVYANIMATIONOFF === 'true',
  legendOff: process.env.NEXT_PUBLIC_FLAG_LEGENDOFF === 'true',
  tooltipOff: process.env.NEXT_PUBLIC_FLAG_TOOLTIPOFF === 'true',
} as const

export type RuntimeFlag = keyof typeof envFlags

export function isFlagOn(key: RuntimeFlag): boolean {
  if (typeof window !== 'undefined') {
    const v = localStorage.getItem(`flags.${key}`)
    if (v === 'true') return true
    if (v === 'false') return false
  }
  return envFlags[key]
}
