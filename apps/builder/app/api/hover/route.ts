import { NextResponse } from 'next/server'
import { readFile, writeFile } from 'node:fs/promises'
import { mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

const ROOT = resolve(process.cwd(), '..', 'preview')
const FILE = resolve(ROOT, 'samples', `hover-presets.json`)

export async function GET() {
  try {
    const json = await readFile(FILE, 'utf-8')
    return NextResponse.json({ items: JSON.parse(json) })
  } catch {
    return NextResponse.json({ items: [] })
  }
}

export async function POST(req: Request) {
  const { preset } = (await req.json()) as any
  let arr: any[] = []
  try { arr = JSON.parse(await readFile(FILE, 'utf-8')) } catch {}
  const i = arr.findIndex((p:any)=>p.id===preset.id)
  if (i>=0) arr[i]=preset; else arr.push(preset)
  mkdirSync(dirname(FILE), { recursive: true })
  await writeFile(FILE, JSON.stringify(arr, null, 2), 'utf-8')
  return NextResponse.json({ ok:true })
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error:'id required' }, { status:400 })
  let arr: any[] = []
  try { arr = JSON.parse(await readFile(FILE, 'utf-8')) } catch {}
  arr = arr.filter((p:any)=>p.id!==id)
  await writeFile(FILE, JSON.stringify(arr, null, 2), 'utf-8')
  return NextResponse.json({ ok:true })
}

