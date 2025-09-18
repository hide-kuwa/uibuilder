export type DsPreview<T = unknown> = { data: T; ts: number };
export async function preview(_key: string): Promise<DsPreview> {
  // ひとまず空データを返す（UIはフォールバック表示）
  return { data: {}, ts: Date.now() };
}
export async function fetchWithTTL<T = unknown>(_url: string, _ttlMs = 5000): Promise<T> {
  // builder内のプレビュー用途のみ：単純fetchの薄ラッパに差し替え可
  const res = await fetch(_url);
  return (await res.json()) as T;
}

export async function fetchJSON<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  return (await res.json()) as T;
}

export async function fetchJSONv2<T = unknown>(url: string, opts?: RequestInit): Promise<T> {
  return fetchJSON<T>(url, opts);
}
