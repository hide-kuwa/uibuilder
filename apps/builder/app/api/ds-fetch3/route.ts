import { NextResponse } from 'next/server'
import { fetchJSONv2 } from '@chizu/ui/ds/fetcher'

export async function POST(req: Request) {
  try {
    const { url, opts } = await req.json()
    const data = await fetchJSONv2(String(url), opts || {})
    const text = JSON.stringify(data)
    return NextResponse.json({
      ok: true,
      len: text.length,
      preview: text.slice(0, 800),
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 400 })
  }
}

