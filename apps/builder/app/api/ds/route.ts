import { NextResponse } from 'next/server'
import { readFile, writeFile } from 'node:fs/promises'
import { mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

const ROOT = resolve(process.cwd(), '..', 'preview')
const FILE = resolve(ROOT, 'samples', 'data-sources.json')

export async function GET(){
  try {
    const json = await readFile(FILE, 'utf-8')
    return NextResponse.json({ items: JSON.parse(json) })
  } catch {
    return NextResponse.json({ items: [] })
  }
}

export async function POST(req: Request){
  const { item } = await req.json() as any
  if (!item?.key || !item?.url) return NextResponse.json({ error:'invalid' }, { status:400 })
  let arr:any[]=[]
  try{ arr = JSON.parse(await readFile(FILE,'utf-8')) }catch{}
  if (arr.some(x=>x.key===item.key)) {
    const i = arr.findIndex((x:any)=>x.key===item.key)
    const same = JSON.stringify(arr[i])
    const incoming = JSON.stringify(item)
    if (same !== incoming) return NextResponse.json({ error:'exists' }, { status:409 })
  }
  const i = arr.findIndex((x:any)=>x.key===item.key)
  if (i>=0) arr[i]=item; else arr.push(item)
  mkdirSync(dirname(FILE), { recursive:true })
  await writeFile(FILE, JSON.stringify(arr,null,2), 'utf-8')
  return NextResponse.json({ ok:true })
}

export async function DELETE(req: Request){
  const key = new URL(req.url).searchParams.get('key')
  if(!key) return NextResponse.json({ error:'key required' }, { status:400 })
  let arr:any[]=[]
  try{ arr = JSON.parse(await readFile(FILE,'utf-8')) }catch{}
  arr = arr.filter((x:any)=>x.key!==key)
  await writeFile(FILE, JSON.stringify(arr,null,2), 'utf-8')
  return NextResponse.json({ ok:true })
}
