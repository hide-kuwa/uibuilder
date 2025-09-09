// apps/builder/app/api/export/route.ts
import { NextResponse } from 'next/server'
import JSZip from 'jszip'
import { generatePageCode } from '@chizu/renderer'
import crypto from 'node:crypto'
// append-only: assets bundling for det=2
import fs from 'node:fs'
import path from 'node:path'
// append-only: UI audit scoring
import { evaluateAudit, type ComponentNode } from '../../../lib/ui-audit'

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

    // --- append-only: det=2 (deterministic + include public/assets) ---
    try {
      const detParam = new URL(req.url).searchParams.get('det')
      if (detParam === '2') {
        const depsList = Array.isArray(deps) ? [...deps].sort() : []
        const z3 = new JSZip()
        const code = generatePageCode({ page }) as any
        const tsx = (code && typeof code === 'object' && 'tsx' in code) ? code.tsx : code
        const contentHash = crypto.createHash('sha256').update(String(tsx ?? '')).digest('hex')
        const slug = String(page?.id || 'page')

        // Load ComponentNode[] from public/pages/<slug>.json (optional)
        let audit: { scores: any; issues: any; issuesDetail: any } | null = null
        try {
          const file = path.join(process.cwd(), 'public', 'pages', `${slug}.json`)
          if (fs.existsSync(file)) {
            const txt = fs.readFileSync(file, 'utf8')
            const data = JSON.parse(txt)
            const tree: ComponentNode[] | null = Array.isArray(data?.tree)
              ? (data.tree as ComponentNode[])
              : (Array.isArray(data) ? (data as ComponentNode[]) : null)
            if (tree) {
              const { scores, issues, issuesDetail } = evaluateAudit(tree)
              audit = { scores, issues, issuesDetail }
            }
          }
        } catch {
          // ignore audit failures; proceed without
        }

        // collect assets under public/assets (whitelisted extensions)
        const assetsDir = path.join(process.cwd(), 'public', 'assets')
        const allow = new Set(['.json', '.png', '.jpg', '.jpeg', '.svg', '.css', '.js'])
        const assets: string[] = []
        const walk = (dir: string, relBase = 'assets') => {
          let ents: fs.Dirent[] = []
          try { ents = fs.readdirSync(dir, { withFileTypes: true }) } catch { return }
          for (const ent of ents) {
            const abs = path.join(dir, ent.name)
            const rel = path.join(relBase, ent.name).replace(/\\/g, '/')
            if (ent.isDirectory()) { walk(abs, rel); continue }
            const ext = path.extname(ent.name).toLowerCase()
            if (!allow.has(ext)) continue
            try {
              const buf = fs.readFileSync(abs)
              // root-level
              z3.file(rel, buf, { date: DET_DATE })
              // nested under slug/
              z3.file(`${slug}/${rel}`, buf, { date: DET_DATE })
              assets.push(rel)
            } catch { /* ignore */ }
          }
        }
        walk(assetsDir)

        // root-level files (kept for backward compat)
        z3.file('page.tsx', tsx, { date: DET_DATE })
        const rootManifest = { id: page.id, title: page.title ?? '', generatedAt: DET_DATE_ISO, contentHash, assets }
        z3.file('manifest.json', JSON.stringify(rootManifest, null, 2), { date: DET_DATE })
        z3.file('README.md', `# Exported Page\nid: ${page.id}\nImport and render page.tsx in your host app.\n`, { date: DET_DATE })
        depsList.forEach((name: string) => z3.file(`deps/${name}.txt`, 'placeholder', { date: DET_DATE }))

        // nested under <slug>/ with uiAudit artifacts
        z3.file(`${slug}/page.tsx`, tsx, { date: DET_DATE })
        const nestedManifest: any = { id: page.id, title: page.title ?? '', generatedAt: DET_DATE_ISO, contentHash, assets }
        if (audit) nestedManifest.uiAudit = { scores: audit.scores, issues: audit.issues }
        z3.file(`${slug}/manifest.json`, JSON.stringify(nestedManifest, null, 2), { date: DET_DATE })
        if (audit) z3.file(`${slug}/uiAudit.json`, JSON.stringify(audit, null, 2), { date: DET_DATE })
        z3.file(`${slug}/README.md`, `# Exported Page\nid: ${page.id}\nImport and render page.tsx in your host app.\n`, { date: DET_DATE })
        depsList.forEach((name: string) => z3.file(`${slug}/deps/${name}.txt`, 'placeholder', { date: DET_DATE }))

        const buf3 = await z3.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } })
        return new Response(buf3, {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${page?.id || 'page'}-export.zip"`,
            'Cache-Control': 'no-store',
            'Content-Length': String(buf3.byteLength),
          },
        })
      }
    } catch { /* ignore and fall back */ }

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
