import { NextResponse } from 'next/server'
import { readFile, writeFile, unlink, stat } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { generatePageCode } from '@chizu/renderer'
import type { Page, Frame } from '@chizu/types'
import { mkdirSync } from 'node:fs'

export async function POST(req: Request) {
  const { oldId, newId } = (await req.json()) as { oldId?: string; newId?: string }
  if (!oldId || !newId || oldId === newId) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  const root = resolve(process.cwd(), '..', 'preview')
  const sampleOld = resolve(root, 'samples', `page.${oldId}.json`)
  const sampleNew = resolve(root, 'samples', `page.${newId}.json`)
  try { await stat(sampleNew); return NextResponse.json({ error:'exists' }, { status:409 }) } catch {}
  const manifestPath = resolve(root, 'generated', 'manifest.json')

  let page: Page
  try {
    const json = await readFile(sampleOld, 'utf-8')
    page = JSON.parse(json) as Page
  } catch {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  page = { ...page, id: newId }

  let manifest: Record<string, string> = {}
  try {
    manifest = JSON.parse(await readFile(manifestPath, 'utf-8'))
  } catch {}

  const frames: Frame[] = [
    { id:'frame-basic', name:'Basic', slots:[{name:'header'},{name:'sidebar'},{name:'content',required:true},{name:'footer'}] },
    { id:'frame-top', name:'TopOnly', slots:[{name:'header'},{name:'content',required:true}] },
    { id:'frame-wide', name:'Wide', slots:[{name:'content',required:true},{name:'footer'}] },
  ]
  const frame = frames.find(f => f.id === (page as Page).frameId) ?? frames[0]
  const { tsx, fileName } = generatePageCode({ page, frame, registryImport: '@chizu/registry' })

  const tsxNew = resolve(root, 'generated', 'pages', fileName)
  mkdirSync(dirname(sampleNew), { recursive: true })
  mkdirSync(dirname(tsxNew), { recursive: true })
  await writeFile(sampleNew, JSON.stringify(page, null, 2), 'utf-8')
  await writeFile(tsxNew, tsx, 'utf-8')

  const oldFile = manifest[oldId]
  if (oldFile) {
    try { await unlink(resolve(root, 'generated', 'pages', oldFile)) } catch {}
  }
  try { await unlink(sampleOld) } catch {}

  delete manifest[oldId]
  manifest[newId] = fileName
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8')

  return NextResponse.json({ ok: true, id: newId, file: fileName })
}
