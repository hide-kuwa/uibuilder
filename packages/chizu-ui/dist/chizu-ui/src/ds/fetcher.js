export async function fetchJSON(url, opt = {}) {
    const { timeoutMs = 8000, retries = 1, retryDelayMs = 400, headers = {} } = opt;
    let lastErr;
    for (let i = 0; i <= retries; i++) {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(new Error('timeout')), timeoutMs);
        try {
            const res = await fetch(url, { signal: ctrl.signal, headers });
            clearTimeout(t);
            if (!res.ok)
                throw new Error(`HTTP ${res.status}`);
            const ct = res.headers.get('content-type') || '';
            return ct.includes('application/json') ? await res.json() : await res.text();
        }
        catch (e) {
            lastErr = e;
            clearTimeout(t);
            if (i < retries)
                await new Promise(r => setTimeout(r, retryDelayMs));
        }
    }
    throw lastErr;
}
/**
 * fetchJSONv2: timeout / retries / backoff / headers 対応版
 * 既存の fetchJSON はそのまま。必要箇所だけこちらに切替可。
 */
export async function fetchJSONv2(url, opts = {}) {
    const { timeoutMs = 10_000, retries = 0, backoffMs = 300, headers = {}, signal } = opts;
    let attempt = 0;
    let lastErr;
    while (attempt <= retries) {
        const ac = new AbortController();
        const timer = setTimeout(() => ac.abort(new Error('timeout')), timeoutMs);
        try {
            const res = await fetch(url, {
                headers,
                signal: signal ?? ac.signal,
                cache: 'no-store',
            });
            clearTimeout(timer);
            if (!res.ok)
                throw new Error(`HTTP ${res.status}`);
            return await res.json();
        }
        catch (e) {
            clearTimeout(timer);
            lastErr = e;
            if (attempt === retries)
                break;
            await new Promise((r) => setTimeout(r, backoffMs * Math.max(1, attempt + 1)));
            attempt++;
        }
    }
    throw lastErr;
}
// --- /append-only ---
