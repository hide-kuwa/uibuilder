import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import {
  pageSnapshotSchema,
  type PageSnapshot,
} from '../../../../src/schemas/page';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = pageSnapshotSchema.safeParse(json);
    if (!parsed.success) {
      const msg = parsed.error.errors
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const body: PageSnapshot = parsed.data;
    const pagesDir = path.join(process.cwd(), 'data/pages');
    await mkdir(pagesDir, { recursive: true });
    const filePath = path.join(pagesDir, `${body.pageId}.json`);
    await writeFile(filePath, JSON.stringify(body, null, 2), 'utf8');
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const message = err?.message ?? 'Failed to save page';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

