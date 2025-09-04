export const ENABLE_DYNAMIC_ELM_IMPORT = false
export const ENABLE_UNIFIED_PREVIEW = true

export function isFlagOn(key: string): boolean {
  if (typeof window !== 'undefined') {
    const v = localStorage.getItem(`flags.${key}`)
    if (v === 'true') return true
    if (v === 'false') return false
  }
  const env = process.env[`NEXT_PUBLIC_FLAG_${key.toUpperCase()}`]
  return env === 'true'
}
