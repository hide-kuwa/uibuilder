import Link from 'next/link'

const previewHref = (slug: string) => `/preview/${encodeURIComponent(slug)}`

export function ShareMenu({ slug }: { slug: string }) {
  return <Link href={previewHref(slug)} prefetch={false}>Preview</Link>
}

