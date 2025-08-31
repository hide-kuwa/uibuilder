export function toCssVar(v: any) {
  if (typeof v !== 'string') return v
  if (v.startsWith('token:')) return `var(--${v.slice(6).replace(/\./g, '-')})`
  return v
}
