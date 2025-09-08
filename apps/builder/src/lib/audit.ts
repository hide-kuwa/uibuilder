// append-only audit shim: 後でここをPOST送信に差し替えるだけで全呼び出しが切り替わる
export function audit(op: string, payload: any) {
  // eslint-disable-next-line no-console
  console.info('[audit]', { op, ...payload });
}

