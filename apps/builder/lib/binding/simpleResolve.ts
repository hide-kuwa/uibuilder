// standalone simple resolver for unit tests (no external deps)
export function resolveBinding(expr: string, ctx: any): any {
  const evalPath = (path: string) => {
    const parts = path.trim().split('.')
    let cur: any = ctx
    for (const seg of parts) {
      if (!seg) continue
      if (cur == null) return undefined
      cur = cur[seg]
    }
    return cur
  }
  if (expr.includes('??')) {
    const [l, r] = expr.split('??')
    const left = resolveBinding(l.trim(), ctx)
    if (left !== null && left !== undefined) return left
    const rhs = r.trim()
    try {
      return JSON.parse(rhs)
    } catch {}
    const num = Number(rhs)
    if (!Number.isNaN(num)) return num
    return rhs.replace(/^['"]|['"]$/g, '')
  }
  return evalPath(expr)
}

export const simpleResolve = resolveBinding

