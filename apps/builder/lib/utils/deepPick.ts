function tokenize(path: string): (string | number)[] {
  const out: (string | number)[] = []
  const re = /([^.\[\]]+)|(\[(\d+)\])/g
  let m: RegExpExecArray | null
  while ((m = re.exec(path))) {
    if (m[1]) out.push(m[1])
    else if (m[3]) out.push(Number(m[3]))
  }
  return out
}

function getAt(input: any, tokens: (string | number)[]) {
  let cur = input
  for (const t of tokens) {
    if (cur == null) return undefined
    if (typeof t === 'number') {
      if (!Array.isArray(cur)) return undefined
      cur = cur[t]
    } else {
      if (typeof cur !== 'object') return undefined
      cur = (cur as any)[t]
    }
  }
  return cur
}

function setAt(target: any, tokens: (string | number)[], value: any) {
  let cur = target
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    const isLast = i === tokens.length - 1
    if (typeof t === 'number') {
      if (!Array.isArray(cur)) return // invalid shape; skip
      if (isLast) {
        // ensure filler objects up to index
        while (cur.length < t) cur.push({})
        cur[t] = value
      } else {
        const next = tokens[i + 1]
        while (cur.length <= t) cur.push({})
        if (cur[t] == null) cur[t] = typeof next === 'number' ? [] : {}
        cur = cur[t]
      }
    } else {
      if (isLast) {
        ;(cur as any)[t] = value
      } else {
        const next = tokens[i + 1]
        if ((cur as any)[t] == null) (cur as any)[t] = typeof next === 'number' ? [] : {}
        cur = (cur as any)[t]
      }
    }
  }
}

export function deepPick(obj: any, paths: string[]) {
  const out: any = {}
  for (const p of paths) {
    const tokens = tokenize(p)
    // prime target shape root for array tokens
    if (typeof tokens[0] === 'number') continue // root array index unsupported for now
    // ensure root exists
    let cur = out
    for (let i = 0; i < tokens.length - 1; i++) {
      const t = tokens[i]
      const next = tokens[i + 1]
      if (typeof t === 'number') {
        if (!Array.isArray(cur)) break
      } else {
        if (cur[t as any] == null) cur[t as any] = typeof next === 'number' ? [] : {}
        cur = cur[t as any]
      }
    }
    const val = getAt(obj, tokens)
    if (val === undefined) continue
    // Now set value properly
    setAt(out, tokens, val)
  }
  return out
}

