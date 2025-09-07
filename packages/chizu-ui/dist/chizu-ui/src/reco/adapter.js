// Example: project from arbitrary rows (e.g., journal or invoice rows)
// Overload/extend mappings later as needed.
export function projectRows(rows, map) {
    return rows.map((r) => ({
        id: String(r[map.id]),
        amount: Number(r[map.amount] ?? 0),
        memo: map.memo ? String(r[map.memo] ?? '') : '',
    }));
}
