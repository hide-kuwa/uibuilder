// append-only: project domain rows to { id, amount, memo }
export type RecoRow = { id: string; amount: number; memo?: string }

// Example: project from arbitrary rows (e.g., journal or invoice rows)
// Overload/extend mappings later as needed.
export function projectRows<T extends Record<string, any>>(
  rows: T[],
  map: { id: keyof T; amount: keyof T; memo?: keyof T }
): RecoRow[] {
  return rows.map((r) => ({
    id: String(r[map.id]),
    amount: Number(r[map.amount] ?? 0),
    memo: map.memo ? String(r[map.memo] ?? '') : '',
  }))
}

