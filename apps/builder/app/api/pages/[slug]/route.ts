// apps/builder/app/api/pages/[slug]/route.ts
import { NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'
import type { PageMeta } from '../../../../types/page-meta'

function readJsonSafe(abs: string): any | null {
  try { return JSON.parse(fs.readFileSync(abs, 'utf8')) } catch { return null }
}

function writeJsonSafe(abs: string, obj: any) {
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, JSON.stringify(obj, null, 2))
}

function resolveMeta(raw: any, slug: string, mtimeISO: string): PageMeta {
  const src: any = Array.isArray(raw?.tree) || Array.isArray(raw) ? raw : raw || {}
  return {
    slug: String(src.slug ?? slug),
    title: String(src.title ?? slug),
    tags: Array.isArray(src.tags) ? src.tags.map(String) : [],
    description: typeof src.description === 'string' ? src.description : undefined,
    hidden: typeof src.hidden === 'boolean' ? src.hidden : undefined,
    updatedAt: typeof src.updatedAt === 'string' ? src.updatedAt : mtimeISO,
    contentHash: typeof src.contentHash === 'string' ? src.contentHash : undefined,
  }
}

export async function GET(_: Request, ctx: { params: { slug: string } }) {
  try {
    const slug = ctx.params.slug
    const file = path.join(process.cwd(), 'public', 'pages', `${slug}.json`)
    if (!fs.existsSync(file)) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
    const raw = readJsonSafe(file)
    const st = fs.statSync(file)
    const meta = resolveMeta(raw, slug, st.mtime.toISOString())
    return NextResponse.json({ ok: true, item: meta })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 })
  }
}

export async function PATCH(req: Request, ctx: { params: { slug: string } }) {
  try {
    const slug = ctx.params.slug
    const file = path.join(process.cwd(), 'public', 'pages', `${slug}.json`)
    if (!fs.existsSync(file)) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
    const body = await req.json().catch(() => ({}))
    // simple validation without zod
    const updates: Partial<PageMeta> = {}
    if (typeof body.title === 'string') updates.title = body.title
    if (Array.isArray(body.tags)) updates.tags = body.tags.map(String)
    if (typeof body.description === 'string' || body.description === null) updates.description = body.description ?? undefined
    if (typeof body.hidden === 'boolean') updates.hidden = body.hidden

    const raw = readJsonSafe(file)
    let data: any
    if (Array.isArray(raw)) {
      data = { tree: raw }
    } else if (raw && typeof raw === 'object') {
      data = { ...raw }
    } else {
      data = {}
    }
    data.slug = slug
    if (updates.title !== undefined) data.title = updates.title
    if (updates.tags !== undefined) data.tags = updates.tags
    if (updates.description !== undefined) data.description = updates.description
    if (updates.hidden !== undefined) data.hidden = updates.hidden
    data.updatedAt = new Date().toISOString()

    writeJsonSafe(file, data)
    const meta = resolveMeta(data, slug, data.updatedAt)
    return NextResponse.json({ ok: true, item: meta })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 })
  }
}

