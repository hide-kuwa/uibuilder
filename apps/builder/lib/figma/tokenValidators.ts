export const isColorLike = (v: string) =>
  /^#([0-9a-f]{3,8})$/i.test(v) ||
  /^rgba?\(/i.test(v) || /^hsla?\(/i.test(v) ||
  /^oklch\(/i.test(v) || /^var\(--/i.test(v) ||
  /^linear-gradient\(/i.test(v)

export const isPxLike = (v: string) =>
  /^\d+(\.\d+)?(px|rem|em|%)$/.test(v)

