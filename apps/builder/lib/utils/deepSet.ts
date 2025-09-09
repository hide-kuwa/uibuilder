const FORBIDDEN = new Set(['__proto__', 'prototype', 'constructor'])

export function deepSet(obj: any, rawPath: string, value: any) {
  const path = rawPath.replace(/\[(\d+)\]/g, '.$1').split('.')
  let cur = obj
  for (let i = 0; i < path.length; i++) {
    const seg = path[i]
    if (!seg || FORBIDDEN.has(seg)) return
    const last = i === path.length - 1
    if (last) {
      cur[seg] = value
    } else {
      const nextSeg = path[i + 1]
      const isIndex = /^\d+$/.test(nextSeg)
      if (cur[seg] == null) cur[seg] = isIndex ? [] : {}
      cur = cur[seg]
    }
  }
}

