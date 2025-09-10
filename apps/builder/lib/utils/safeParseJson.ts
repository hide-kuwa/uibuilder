<<<<<<< HEAD
export function safeParseJson<T = any>(text: string, fallback: T): T {
  try {
    const v = JSON.parse(text)
    return v as T
=======
export function safeParseJson<T = unknown>(s: string, fallback: T): T {
  try {
    return JSON.parse(s)
>>>>>>> origin/test/fastwin-unit-6d
  } catch {
    return fallback
  }
}

