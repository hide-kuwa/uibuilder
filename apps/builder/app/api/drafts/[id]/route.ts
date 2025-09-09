// apps/builder/app/api/drafts/[id]/route.ts
import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const ROOT = process.cwd()
const DRAFT_DIR = path.join(ROOT, '.data', 'drafts')

async function ensureDir() {
  await fs.mkdir(DRAFT_DIR, { recursive: true })
}
async function readDraft(id: string) {
  try {
    const p = path.join(DRAFT_DIR, `${id}.json`)
    return JSON.parse(await fs.readFile(p, 'utf8'))
  } catch {
    return null
  }
}
async function writeDraft(id: string, obj: any) {
  await ensureDir()
  const p = path.join(DRAFT_DIR, `${id}.json`)
  await fs.writeFile(p, JSON.stringify(obj, null, 2), 'utf8')
}

import { sanitizeSlug } from '@/lib/utils/sanitize'

export async function GET(_: Request, { params: { id } }: { params: { id: string } }) {
  const obj = await readDraft(sanitizeSlug(id))
  return NextResponse.json(obj ?? { data: null, updatedAt: 0 })
}

export async function PUT(req: Request, { params: { id } }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({})) // { data, updatedAt }
  await writeDraft(sanitizeSlug(id), body) // last-write-wins
  return NextResponse.json({ ok: true })
}
