export function deriveIndexes<T>(items: T[]): number[] {
  return items.map((_, i) => i)
}

