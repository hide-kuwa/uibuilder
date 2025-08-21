'use client'

export const API_BASE =
  (typeof window !== 'undefined' && (window as any).NEXT_PUBLIC_API_BASE) ||
  process.env.NEXT_PUBLIC_API_BASE ||
  'http://127.0.0.1:8000';

const KEY = 'uibuilder.jwt';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEY);
}

export function setToken(t: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, t);
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}

type FetchOpts = RequestInit & { json?: any };

export async function apiFetch<T = any>(path: string, opts: FetchOpts = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as any),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    ...opts,
    headers,
    body: opts.json !== undefined ? JSON.stringify(opts.json) : opts.body,
  });

  if (res.status === 401) {
    clearToken();
    throw new Error('Unauthorized: please login again.');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  // for /edge-config/* where response is JSON but may be streamed
  try { return (await res.json()) as T; } catch {
    return (await res.text()) as any;
  }
}

