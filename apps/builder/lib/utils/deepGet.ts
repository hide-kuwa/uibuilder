// apps/builder/lib/utils/deepGet.ts
const FORBIDDEN = new Set(['__proto__', 'prototype', 'constructor'])
export function deepGet(obj: any, rawPath?: string) {
  if (!rawPath) return obj
  const path = rawPath.replace(/\[(\d+)\]/g, '.$1').split('.')
  let cur = obj
  for (const seg of path) {
    if (!seg || FORBIDDEN.has(seg)) return undefined
    if (cur == null) return undefined
    cur = cur[seg]
  }
  return cur
}

