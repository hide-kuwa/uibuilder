import { NextResponse } from 'next/server'
import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'

export async function GET() {
  const dir = resolve(process.cwd(), '..', 'preview', 'samples')
  try {
    const files = await readdir(dir, { withFileTypes: true })
    const ids = files
      .filter((f) => f.isFile() && /^page\..+\.json$/.test(f.name))
      .map((f) => f.name.replace(/^page\.(.+)\.json$/, '$1'))
      .sort()
    return NextResponse.json({ ids })
  } catch {
    return NextResponse.json({ ids: [] })
  }
}

