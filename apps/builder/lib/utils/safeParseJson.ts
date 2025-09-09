export function safeParseJson<T = any>(text: string, fallback: T): T {
  try {
    const v = JSON.parse(text)
    return v as T
  } catch {
    return fallback
  }
}

