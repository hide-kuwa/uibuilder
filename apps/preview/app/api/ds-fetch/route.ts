import { NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

type Item = { key:string; url:string; ttlSec?:number }
type CacheEntry = { exp:number; data:any }
const CACHE = new Map<string, CacheEntry>()

const ROOT = resolve(process.cwd(), '..', 'preview')
const FILE = resolve(ROOT, 'samples', 'data-sources.json')

async function loadList(): Promise<Item[]> {
  try {
    const json = await readFile(FILE, 'utf-8')
    return JSON.parse(json) as Item[]
  } catch { return [] }
}

async function fetchJSON(url: string): Promise<any> {
  const r = await fetch(url, { method:'GET', cache:'no-store' })
  return await r.json()
}

export async function GET() {
  const list = await loadList()
  const out: Record<string, any> = {}
  const now = Date.now()
  for (const it of list) {
    const key = it.key
    const ttl = (it.ttlSec ?? 0) * 1000
    const ce = CACHE.get(key)
    if (ce && ce.exp > now) {
      out[key] = ce.data
      continue
    }
    try {
      const data = await fetchJSON(it.url)
      out[key] = data
      if (ttl > 0) CACHE.set(key, { exp: now + ttl, data })
      else CACHE.delete(key)
    } catch {
      out[key] = null
    }
  }
  return NextResponse.json(out, { headers: { 'Cache-Control': 'no-store' } })
}

