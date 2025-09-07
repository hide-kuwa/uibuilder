import { NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

type Item = { key:string; url:string; ttlSec?:number }
type Entry = { exp:number; data:any }
const CACHE = new Map<string, Entry>()

const ROOT = resolve(process.cwd(), '..', 'preview')
const FILE = resolve(ROOT, 'samples', 'data-sources.json')

async function loadList(): Promise<Item[]> {
  try { return JSON.parse(await readFile(FILE, 'utf-8')) as Item[] } catch { return [] }
}

export async function GET(req: Request) {
  const u = new URL(req.url)
  const key = u.searchParams.get('key') || ''
  if (!key) return NextResponse.json({ error:'key required' }, { status:400 })

  const list = await loadList()
  const it = list.find(x=>x.key===key)
  if (!it) return NextResponse.json({ error:'not found' }, { status:404 })

  const ttl = (it.ttlSec ?? 0) * 1000
  const now = Date.now()
  const ce = CACHE.get(key)
  if (ce && ce.exp > now) return NextResponse.json({ key, data: ce.data })

  try {
    const r = await fetch(it.url, { method:'GET', cache:'no-store' })
    const data = await r.json()
    if (ttl>0) CACHE.set(key, { exp: now+ttl, data }); else CACHE.delete(key)
    return NextResponse.json({ key, data })
  } catch {
    return NextResponse.json({ key, data: null })
  }
}

