// apps/builder/lib/utils/debounce.ts
export const debounce = <T extends any[]>(fn: (...a: T) => void, ms = 1000) => {
  let t: any
  return (...a: T) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms) }
}

