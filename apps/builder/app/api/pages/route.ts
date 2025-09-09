// apps/builder/app/api/pages/route.ts
import { NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'
import type { PageMeta } from '../../../types/page-meta'

function readJsonSafe(abs: string): any | null {
  try { return JSON.parse(fs.readFileSync(abs, 'utf8')) } catch { return null }
}

function statSafe(abs: string): fs.Stats | null {
  try { return fs.statSync(abs) } catch { return null }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const showHidden = url.searchParams.get('showHidden') === '1'
    const dir = path.join(process.cwd(), 'public', 'pages')
    let entries: PageMeta[] = []
    try {
      const ents = fs.readdirSync(dir, { withFileTypes: true })
      for (const ent of ents) {
        if (!ent.isFile() || !ent.name.toLowerCase().endsWith('.json')) continue
        const abs = path.join(dir, ent.name)
        const baseSlug = path.basename(ent.name, '.json')
        const raw = readJsonSafe(abs)
        const st = statSafe(abs)
        const updatedAt = st ? st.mtime.toISOString() : new Date().toISOString()
        let meta: PageMeta = { slug: baseSlug, title: baseSlug, tags: [], updatedAt }
        if (raw && typeof raw === 'object') {
          const src: any = Array.isArray(raw?.tree) || Array.isArray(raw) ? (raw as any) : raw
          meta = {
            slug: String((src.slug ?? baseSlug) || baseSlug),
            title: String(src.title ?? baseSlug),
            tags: Array.isArray(src.tags) ? src.tags.map(String) : [],
            description: typeof src.description === 'string' ? src.description : undefined,
            hidden: typeof src.hidden === 'boolean' ? src.hidden : undefined,
            updatedAt: typeof src.updatedAt === 'string' ? src.updatedAt : updatedAt,
            contentHash: typeof src.contentHash === 'string' ? src.contentHash : undefined,
          }
        }
        entries.push(meta)
      }
    } catch {}
    if (!showHidden) entries = entries.filter((m) => !m.hidden)
    entries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    return NextResponse.json({ ok: true, items: entries })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 })
  }
}

