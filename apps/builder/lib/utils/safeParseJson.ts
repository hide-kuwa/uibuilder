export function safeParseJson<T = unknown>(s: string, fallback: T): T {
  try {
    return JSON.parse(s)
  } catch {
    return fallback
  }
}

