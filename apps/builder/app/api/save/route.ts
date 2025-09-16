import { NextResponse } from 'next/server'
import { mkdirSync, writeFileSync } from 'fs'
import path from 'path'

import { sanitizeSlug } from '@/lib/utils/sanitize'

const draftsDir = path.join(process.cwd(), '.data', 'drafts')

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ ok: false, error: 'Invalid body' }, { status: 400 })
    }

    const rawId = 'id' in body
      ? String((body as any).id ?? 'unknown')
      : typeof (body as any)?.page === 'object' && (body as any).page && 'id' in (body as any).page
        ? String(((body as any).page as any).id ?? 'unknown')
        : 'unknown'
    const id = sanitizeSlug(rawId)

    const savedAt = new Date().toISOString()
    const lastWriteTs = typeof (body as any)?.lastWriteTs === 'number'
      ? Number((body as any).lastWriteTs)
      : Date.now()

    mkdirSync(draftsDir, { recursive: true })
    const targetPath = path.join(draftsDir, `${id}.json`)
    writeFileSync(targetPath, JSON.stringify(body, null, 2), 'utf8')

    return NextResponse.json({ ok: true, savedAt, lastWriteTs, id }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

