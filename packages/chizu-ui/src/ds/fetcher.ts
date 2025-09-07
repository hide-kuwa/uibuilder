import { FetchJSONOptions } from './types'

export async function fetchJSON(url: string, opt: FetchJSONOptions = {}) {
  const { timeoutMs = 8000, retries = 1, retryDelayMs = 400, headers = {} } = opt
  let lastErr: any
  for (let i = 0; i <= retries; i++) {
    const ctrl = new AbortController()
    const t = setTimeout(()=>ctrl.abort(new Error('timeout')), timeoutMs)
    try {
      const res = await fetch(url, { signal: ctrl.signal, headers })
      clearTimeout(t)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const ct = res.headers.get('content-type') || ''
      return ct.includes('application/json') ? await res.json() : await res.text()
    } catch (e) {
      lastErr = e
      clearTimeout(t)
      if (i < retries) await new Promise(r => setTimeout(r, retryDelayMs))
    }
  }
  throw lastErr
}

