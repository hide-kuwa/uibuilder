// apps/builder/app/api/export/route.ts
import { NextResponse } from 'next/server'
import JSZip from 'jszip'
import { generatePageCode } from '@chizu/renderer'
import crypto from 'node:crypto'

// --- append-only: deterministic ZIP helpers ---
const DET_DATE_ISO = '2000-01-01T00:00:00.000Z'
const DET_DATE = new Date(DET_DATE_ISO)

export async function POST(req: Request) {
  try {
    const { page, deps = [] } = await req.json()
    const url = new URL(req.url)
    const det = url.searchParams.get('det') === '1'
    if (!page) return NextResponse.json({ error: 'page required' }, { status: 400 })

    const code0 = generatePageCode({ page }) as any
    const tsx0 = (code0 && typeof code0 === 'object' && 'tsx' in code0) ? code0.tsx : code0
    const contentHash0 = crypto.createHash('sha256').update(String(tsx0 ?? '')).digest('hex')

    const zip = new JSZip()
    zip.file('page.tsx', tsx0)
    zip.file(
      'manifest.json',
      JSON.stringify({
        id: page.id,
        title: page.title ?? '',
        generatedAt: new Date().toISOString(),
        contentHash: contentHash0,
      }, null, 2)
    )
    zip.file(
      'README.md',
      `# Exported Page\n\nid: ${page.id}\n\nImport and render page.tsx in your host app.\n`
    )

    ;(deps as string[]).forEach((name) => zip.file(`deps/${name}.txt`, 'placeholder'))

    if (det) {
      const depsList = Array.isArray(deps) ? [...deps].sort() : []
      const z2 = new JSZip()
      const code = generatePageCode({ page }) as any
      const tsx2 = (code && typeof code === 'object' && 'tsx' in code) ? code.tsx : code
      const contentHash = crypto.createHash('sha256').update(String(tsx2 ?? '')).digest('hex')
      z2.file('page.tsx', tsx2, { date: DET_DATE })
      z2.file(
        'manifest.json',
        JSON.stringify({ id: page.id, title: page.title ?? '', generatedAt: DET_DATE_ISO, contentHash }, null, 2),
        { date: DET_DATE }
      )
      z2.file(
        'README.md',
        `# Exported Page\nid: ${page.id}\nImport and render page.tsx in your host app.\n`,
        { date: DET_DATE }
      )
      depsList.forEach((name: string) => z2.file(`deps/${name}.txt`, 'placeholder', { date: DET_DATE }))
      const buf2 = await z2.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } })
      return new Response(buf2, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${page?.id || 'page'}-export.zip"`,
          'Cache-Control': 'no-store',
          'Content-Length': String(buf2.byteLength),
        },
      })
    }

    const buf = await zip.generateAsync({ type: 'nodebuffer' })
    // --- append-only: legacy-normal-export kept for policy ---
    const bufLegacy = await __legacyNormalZip(page, deps as string[])
    return new Response(bufLegacy, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${page.id || 'page'}-export.zip"`,
        'Cache-Control': 'no-store',
        'Content-Length': String(bufLegacy.byteLength),
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err || 'export failed') }, { status: 500 })
  }
}

// --- append-only: legacy-normal-export kept for policy ---
async function __legacyNormalZip(page: any, deps: string[] = []) {
  const z = new JSZip()
  const code = generatePageCode({ page }) as any
  const tsx = (code && typeof code === 'object' && 'tsx' in code) ? code.tsx : code
  const contentHash = crypto.createHash('sha256').update(String(tsx ?? '')).digest('hex')
  z.file('page.tsx', tsx)
  z.file('manifest.json', JSON.stringify({
    id: page.id,
    title: page.title ?? '',
    generatedAt: new Date().toISOString(),
    contentHash,
  }, null, 2))
  z.file('README.md', `# Exported Page\nid: ${page.id}\nImport and render page.tsx in your host app.\n`)
  ;(deps ?? []).forEach((name) => z.file(`deps/${name}.txt`, 'placeholder'))
  return z.generateAsync({ type: 'nodebuffer' })
}
