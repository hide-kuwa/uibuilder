import { NextResponse } from 'next/server'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { generatePageCode } from '@chizu/renderer'
import type { Page, Frame } from '@chizu/types'

export async function POST(req: Request) {
  const { page, frame } = (await req.json()) as { page: Page; frame: Frame }
  const root = resolve(process.cwd(), '..', 'preview')
  const samplesOut = resolve(root, 'samples', `page.${page.id}.json`)
  const { tsx, fileName } = generatePageCode({ page, frame, registryImport: '@chizu/registry' })
  const tsxOut = resolve(root, 'generated', 'pages', fileName)
  mkdirSync(dirname(samplesOut), { recursive: true })
  mkdirSync(dirname(tsxOut), { recursive: true })
  writeFileSync(samplesOut, JSON.stringify(page, null, 2), 'utf-8')
  writeFileSync(tsxOut, tsx, 'utf-8')
  // update manifest mapping for hot preview
  const manifestPath = resolve(root, 'generated', 'manifest.json')
  let manifest: Record<string, string> = {}
  try {
    const { readFile } = await import('node:fs/promises')
    manifest = JSON.parse(await readFile(manifestPath, 'utf-8'))
  } catch {}
  manifest[page.id] = fileName
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8')
  return NextResponse.json({ ok: true, file: fileName })
}
