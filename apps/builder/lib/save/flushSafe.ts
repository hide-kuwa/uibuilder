// append-only: outbox単位のシングルフライト
const locks = new WeakMap<object, Promise<any>>()

export async function flushQueueSafe(
  ob: any,
  deps: { post?: any; flushQueue: (ob: any, deps: any) => Promise<any> }
) {
  const cur = locks.get(ob)
  if (cur) return cur
  const p = deps
    .flushQueue(ob, deps)
    .finally(() => {
      if (locks.get(ob) === p) locks.delete(ob)
    })
  locks.set(ob, p)
  return p
}

