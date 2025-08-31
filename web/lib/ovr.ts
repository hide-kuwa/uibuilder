import type { OverrideOp } from '@/types/instanceLike'

function setDeep(obj: any, path: string, value: any) {
  const keys = path.split('.')
  let cur = obj
  for (let i=0;i<keys.length-1;i++) {
    const k = keys[i]
    if (cur[k] == null || typeof cur[k] !== 'object') cur[k] = {}
    cur = cur[k]
  }
  cur[keys[keys.length-1]] = value
}

export function applyOverrides(baseProps: any, ops: OverrideOp[] | undefined) {
  if (!ops?.length) return baseProps
  const out = { ...(baseProps||{}) }
  for (const op of ops) {
    if (op.op === 'setProp') setDeep(out, op.path, op.value)
    else if (op.op === 'mergeStyle') out.style = { ...(out.style||{}), ...(op.value||{}) }
    else if (op.op === 'appendClass') out.className = [out.className, op.value].filter(Boolean).join(' ')
  }
  return out
}
