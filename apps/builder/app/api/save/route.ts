import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const pageId = (typeof body === 'object' && body && 'id' in (body as any))
      ? String((body as any).id)
      : 'unknown'

    // append-only: place to add persistence/audit later

    return NextResponse.json({ ok: true, pageId }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

