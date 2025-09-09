// apps/builder/lib/utils/sanitize.ts
export function sanitizeSlug(input?: string): string {
  const s = (input || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128)
  return s || 'page'
}

