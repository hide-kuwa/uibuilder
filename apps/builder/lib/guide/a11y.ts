export type A11yInput = { label?: string; role?: string; aria?: Record<string, string | number | boolean> }

export function scoreA11y(input: A11yInput) {
  let s = 0
  if (input?.label && String(input.label).trim().length > 0) s += 1
  if (input?.role && String(input.role).trim().length > 0) s += 1
  if (input?.aria && Object.keys(input.aria).length > 0) s += 1
  return s
}

