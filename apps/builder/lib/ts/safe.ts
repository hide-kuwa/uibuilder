export function ensureArr<T>(v: T[] | undefined | null): T[] {
  return Array.isArray(v) ? v : []
}

export function nonNull<T>(v: T | null | undefined): v is T {
  return v != null
}

export function get<T extends object, K extends PropertyKey>(obj: T | null | undefined, key: K): any {
  // @ts-ignore
  return obj?.[key as any]
}

