'use client'
export type Mixed<T> = { kind: 'value'; value: T } | { kind: 'mixed' } | { kind: 'empty' }

export function pickMixed<T>(arr: Array<T | undefined | null>, eq: (a: T, b: T) => boolean = Object.is): Mixed<T> {
  const vals = arr.filter((v): v is T => v != null)
  if (!vals.length) return { kind: 'empty' }
  const first = vals[0]
  for (let i = 1; i < vals.length; i++) if (!eq(first, vals[i]!)) return { kind: 'mixed' }
  return { kind: 'value', value: first }
}

