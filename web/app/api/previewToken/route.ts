import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import {
  createPreviewToken,
  getPreviewToken,
  deletePreviewToken,
  listPreviewTokens,
} from '@/lib/previewTokenStore';

export async function POST(req: NextRequest) {
  const { pageId, expiresIn } = await req.json().catch(() => ({}));
  if (!pageId) {
    return NextResponse.json({ error: 'pageId required' }, { status: 400 });
  }
  const { token, expiresAt } = createPreviewToken(pageId, expiresIn ?? 3600);
  return NextResponse.json({ token, expiresAt, pageId });
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ tokens: listPreviewTokens() });
  }
  const info = getPreviewToken(token);
  if (!info) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  try {
    const filePath = path.join(process.cwd(), 'data/pages', `${info.pageId}.json`);
    const json = await readFile(filePath, 'utf8');
    const page = JSON.parse(json);
    return NextResponse.json({ pageId: info.pageId, expiresAt: info.expiresAt, page });
  } catch {
    return NextResponse.json({ error: 'page not found' }, { status: 404 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'token required' }, { status: 400 });
  }
  deletePreviewToken(token);
  return NextResponse.json({ ok: true });
}
