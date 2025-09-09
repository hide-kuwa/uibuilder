import { NextResponse } from 'next/server'
import JSZip from 'jszip'
import { generateExport } from '@/lib/export/generate'
import { sanitizeSlug } from '@/lib/utils/sanitize'

const DET_DATE = new Date('2000-01-01T00:00:00.000Z')

export async function GET(_: Request, { params: { slug } }: { params: { slug: string } }) {
  try {
    const s = sanitizeSlug(slug)
    const out = await generateExport(s)
    const zip = new JSZip()
    zip.file('page.tsx', out.tsx, { date: DET_DATE })
    zip.file('manifest.json', JSON.stringify(out.manifest, null, 2), { date: DET_DATE })
    zip.file('tokens.json', JSON.stringify(out.tokens, null, 2), { date: DET_DATE })
    const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } })
    console.info('[export.zip]', { slug: s, hash: out.contentHash, bytes: buf.byteLength })
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${s}-${out.contentHash}.zip"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err || 'export failed') })
  }
}

