import { NextResponse } from 'next/server'
import { appendFile, mkdir, readFile } from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), '.data')
const LOG_PATH = path.join(DATA_DIR, 'audit.log')

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true })
}

export async function POST(req: Request) {
  try {
    await ensureDir()
    const body = await req.json().catch(() => ({}))
    const line = JSON.stringify({ t: new Date().toISOString(), ...body }) + '\n'
    await appendFile(LOG_PATH, line, 'utf8')
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.max(1, Math.min(1000, Number(searchParams.get('limit') || '200')))
    const text = await readFile(LOG_PATH, 'utf8').catch(() => '')
    const lines = text.trim().split('\n').filter(Boolean)
    const tail = lines.slice(-limit).map((s) => JSON.parse(s))
    return NextResponse.json({ ok: true, items: tail })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

