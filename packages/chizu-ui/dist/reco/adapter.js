// src/reco/adapter.ts
function projectRows(rows, map) {
  return rows.map((r) => ({
    id: String(r[map.id]),
    amount: Number(r[map.amount] ?? 0),
    memo: map.memo ? String(r[map.memo] ?? "") : ""
  }));
}
export {
  projectRows
};
