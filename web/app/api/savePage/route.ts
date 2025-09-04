import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export type ThemeTokens = {
  [key: string]: any;
};

export type BuilderNode = {
  id: string;
  type: string;
  props?: Record<string, any>;
  children?: BuilderNode[];
};

export type PageSnapshot = {
  pageId: string;
  layoutId: string;
  effectiveTheme: ThemeTokens;
  nodes: BuilderNode[];
  timestamp: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PageSnapshot;
    if (!body?.pageId) {
      return NextResponse.json({ error: 'pageId required' }, { status: 400 });
    }
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

