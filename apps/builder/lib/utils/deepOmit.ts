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

export function deepOmit<T>(obj: T, paths: string[]): T {
  const clone: any = typeof structuredClone === 'function' ? structuredClone(obj as any) : JSON.parse(JSON.stringify(obj))

  for (const p of paths) {
    const tokens = tokenize(p)
    let ref: any = clone
    for (let i = 0; i < tokens.length - 1; i++) {
      const t = tokens[i]
      if (ref == null) break
      ref = typeof t === 'number' ? (Array.isArray(ref) ? ref[t] : undefined) : ref[t]
      if (ref === undefined) break
    }
    const last = tokens[tokens.length - 1]
    if (ref && last !== undefined) {
      if (typeof last === 'number' && Array.isArray(ref)) {
        // remove array element by index, but keep siblings
        ref.splice(last, 1)
      } else if (typeof last === 'string' && typeof ref === 'object') {
        delete ref[last]
      }
    }
  }
  return clone as T
}

