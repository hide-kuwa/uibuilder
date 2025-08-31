'use client'
export type AnyObj = Record<string, any>

export function getVar(obj: AnyObj, path: string): any {
  if (!path) return undefined
  return path.split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), obj)
}

export function evaluate(expr: any, ctx: AnyObj): any {
  if (expr == null || typeof expr === 'number' || typeof expr === 'string' || typeof expr === 'boolean') return expr
  if (Array.isArray(expr)) return expr.map((x) => evaluate(x, ctx))
  const op = Object.keys(expr)[0] as string
  const val = (expr as any)[op]

  switch (op) {
    case 'var':
      return getVar(ctx, String(val))
    case '==':
      return evaluate(val[0], ctx) == evaluate(val[1], ctx)
    case '===':
      return evaluate(val[0], ctx) === evaluate(val[1], ctx)
    case '!=':
      return evaluate(val[0], ctx) != evaluate(val[1], ctx)
    case '!==':
      return evaluate(val[0], ctx) !== evaluate(val[1], ctx)
    case '<':
      return evaluate(val[0], ctx) < evaluate(val[1], ctx)
    case '<=':
      return evaluate(val[0], ctx) <= evaluate(val[1], ctx)
    case '>':
      return evaluate(val[0], ctx) > evaluate(val[1], ctx)
    case '>=':
      return evaluate(val[0], ctx) >= evaluate(val[1], ctx)
    case 'and':
      return (val as any[]).every((v) => !!evaluate(v, ctx))
    case 'or':
      return (val as any[]).some((v) => !!evaluate(v, ctx))
    case '!':
      return !evaluate(val[0], ctx)
    case '+':
      return (val as any[]).reduce((a, b) => Number(evaluate(a, ctx)) + Number(evaluate(b, ctx)))
    case '-':
      return (val as any[]).reduce((a, b) => Number(evaluate(a, ctx)) - Number(evaluate(b, ctx)))
    case '*':
      return (val as any[]).reduce((a, b) => Number(evaluate(a, ctx)) * Number(evaluate(b, ctx)))
    case '/': {
      const xs = (val as any[]).map((v) => Number(evaluate(v, ctx)))
      return xs.slice(1).reduce((a, b) => a / b, xs[0] || 0)
    }
    case '%':
      return Number(evaluate(val[0], ctx)) % Number(evaluate(val[1], ctx))
    default:
      return undefined
  }
}

export function template(input: any, ctx: AnyObj): any {
  if (typeof input !== 'string') return input
  return input.replace(/\{\{\s*([a-zA-Z0-9_.$[\]-]+)\s*\}\}/g, (_, p) => {
    const v = getVar(ctx, p)
    return v == null ? '' : String(v)
  })
}
