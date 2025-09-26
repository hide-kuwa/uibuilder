export function previewHref(slug: string) {
  return `/preview/${encodeURIComponent(slug)}`
}
