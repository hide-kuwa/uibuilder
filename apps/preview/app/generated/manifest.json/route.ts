import { NextResponse } from 'next/server'
import { resolve } from 'node:path'
import { readFile } from 'node:fs/promises'

export async function GET() {
  try {
    const p = resolve(process.cwd(), 'generated', 'manifest.json')
    const txt = await readFile(p, 'utf-8')
    return new NextResponse(txt, { headers: { 'content-type': 'application/json; charset=utf-8' } })
  } catch {
    return NextResponse.json({})
  }
}

