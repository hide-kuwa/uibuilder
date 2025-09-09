import { NextResponse } from 'next/server'
import { generateExport } from '@/lib/export/generate'
import { sanitizeSlug } from '@/lib/utils/sanitize'

export async function GET(_: Request, { params: { slug } }: { params: { slug: string } }) {
  try {
    const out = await generateExport(sanitizeSlug(slug))
    // light size/length guard
    const payload = JSON.stringify(out)
    if (payload.length > 2_000_000) {
      return new NextResponse(JSON.stringify({ error: 'size_limit' }), { headers: { 'Content-Type': 'application/json', 'X-Note': 'export too large' } })
    }
    console.info('[export]', { slug: sanitizeSlug(slug), hash: out.contentHash })
    return NextResponse.json(out)
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err || 'export failed') })
  }
}
