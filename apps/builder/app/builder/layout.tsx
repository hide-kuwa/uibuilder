import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import { ShareMenu } from '@/component/builder/ShareMenu'

export default function BuilderLayout({
  children,
  params,
  searchParams,
}: {
  children: ReactNode
  params?: { slug?: string }
  searchParams?: { slug?: string }
}) {
  // Resolve a deterministic slug from route or query inputs.
  const slug = params?.slug ?? searchParams?.slug ?? 'page-root'
  // headers() is available if an origin is ever required, but ShareMenu stays relative.
  void headers;

  return (
    <div>
      <ShareMenu slug={slug} />
      {children}
    </div>
  )
}
