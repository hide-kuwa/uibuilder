import { NextResponse } from 'next/server'
import { readFile, writeFile, unlink } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { Page } from '@chizu/types'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  try {
    const p = resolve(process.cwd(), '..', 'preview', 'samples', `page.${id}.json`)
    const json = await readFile(p, 'utf-8')
    const page = JSON.parse(json) as Page
    return NextResponse.json({ page })
  } catch {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const root = resolve(process.cwd(), '..', 'preview')
  const samplePath = resolve(root, 'samples', `page.${id}.json`)
  const manifestPath = resolve(root, 'generated', 'manifest.json')

  // 1) manifest読み込み（なければ空）
  let manifest: Record<string, string> = {}
  try {
    const m = await readFile(manifestPath, 'utf-8')
    manifest = JSON.parse(m) as Record<string, string>
  } catch {}

  // 2) 該当TSXを削除（存在すれば）
  const fileName = manifest[id]
  if (fileName) {
    const tsxPath = resolve(root, 'generated', 'pages', fileName)
    try { await unlink(tsxPath) } catch {}
    delete manifest[id]
  }

  // 3) サンプルJSONを削除（存在すれば）
  try { await unlink(samplePath) } catch {}

  // 4) manifestを書き戻し（可能なら）
  try { await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8') } catch {}

  return NextResponse.json({ ok: true })
}
