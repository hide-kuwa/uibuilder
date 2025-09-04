import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  console.log('saveDraft', body);
  return NextResponse.json({ ok: true });
}
