import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  const pageId = req.nextUrl.searchParams.get('pageId');
  if (!pageId) {
    return NextResponse.json({ error: 'pageId required' }, { status: 400 });
  }
  const filePath = path.join(process.cwd(), 'data/pages', `${pageId}.json`);
  try {
    const json = await readFile(filePath, 'utf8');
    return new NextResponse(json, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    if (err?.code === 'ENOENT') {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    const message = err?.message ?? 'Failed to load page';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

