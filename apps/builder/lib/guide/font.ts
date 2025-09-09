export function ensureMinFont(input: { size: number }, rule: { min: number }) {
  const size = Number.isFinite(input?.size) ? input.size : 0
  const min = Number.isFinite(rule?.min) ? rule.min : 0
  return { size: Math.max(size, min) }
}

export function ensureLineHeight(input: { lh: number }, rule: { min: number }) {
  const lh = Number.isFinite(input?.lh) ? input.lh : 0
  const min = Number.isFinite(rule?.min) ? rule.min : 0
  return { lh: Math.max(lh, min) }
}

