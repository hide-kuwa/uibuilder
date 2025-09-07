import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { url, headers } = await req.json()
    const res = await fetch(url, { headers, cache: 'no-store' })
    const text = await res.text()
    return NextResponse.json({ ok: true, status: res.status, len: text.length })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

