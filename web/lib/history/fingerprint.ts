export function fingerprint(elements: any[], meta: any, tokens: any): string {
  return djb2(
    JSON.stringify({
      elements,
      meta,
      tokens,
    })
  )
}

function djb2(str: string): string {
  let h = 5381
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i)
  return String(h >>> 0)
}

export function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let t: any
  return (...args: any[]) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}

