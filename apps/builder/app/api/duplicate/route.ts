import { NextResponse } from 'next/server'
import { readFile, writeFile, stat } from 'node:fs/promises'
import { mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import type { Page, Frame } from '@chizu/types'
import { generatePageCode } from '@chizu/renderer'

const FRAMES: Frame[] = [
  { id:'frame-basic', name:'Basic', slots:[{name:'header'},{name:'sidebar'},{name:'content',required:true},{name:'footer'}] },
  { id:'frame-top', name:'TopOnly', slots:[{name:'header'},{name:'content',required:true}] },
  { id:'frame-wide', name:'Wide', slots:[{name:'content',required:true},{name:'footer'}] }
]

export async function POST(req: Request) {
  const { sourceId, newId } = await req.json() as { sourceId?: string; newId?: string }
  if (!sourceId || !newId || sourceId === newId) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  const root = resolve(process.cwd(), '..', 'preview')
  const src = resolve(root, 'samples', `page.${sourceId}.json`)
  const dst = resolve(root, 'samples', `page.${newId}.json`)
  try { await stat(dst); return NextResponse.json({ error:'exists' }, { status:409 }) } catch {}
  let page: Page
  try {
    page = JSON.parse(await readFile(src, 'utf-8')) as Page
  } catch {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  page = { ...page, id: newId }
  const frame = FRAMES.find(f => f.id === page.frameId) ?? FRAMES[0]
  const { tsx, fileName } = generatePageCode({ page, frame, registryImport: '@chizu/registry' })

  const outTsx = resolve(root, 'generated', 'pages', fileName)
  mkdirSync(dirname(dst), { recursive: true })
  mkdirSync(dirname(outTsx), { recursive: true })
  await writeFile(dst, JSON.stringify(page, null, 2), 'utf-8')
  await writeFile(outTsx, tsx, 'utf-8')

  const manifestPath = resolve(root, 'generated', 'manifest.json')
  let manifest: Record<string, string> = {}
  try { manifest = JSON.parse(await readFile(manifestPath, 'utf-8')) } catch {}
  manifest[newId] = fileName
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8')

  return NextResponse.json({ ok: true, id: newId, file: fileName })
}
