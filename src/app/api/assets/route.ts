import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';

const assetsDir = path.join(process.cwd(), 'public', 'assets');
const manifestPath = path.join(assetsDir, 'index.json');

interface AssetMeta {
  id: string;
  filename: string;
  w: number;
  h: number;
  blurDataUrl: string;
  refs?: string[];
}

async function ensureDir() {
  await fs.mkdir(assetsDir, { recursive: true });
}

async function readManifest(): Promise<AssetMeta[]> {
  try {
    const data = await fs.readFile(manifestPath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeManifest(items: AssetMeta[]) {
  await fs.writeFile(manifestPath, JSON.stringify(items, null, 2));
}

async function scanRefs(filename: string): Promise<string[]> {
  const root = path.join(process.cwd(), 'src');
  const refs: string[] = [];
  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) await walk(p);
      else {
        const content = await fs.readFile(p, 'utf8');
        if (content.includes(`assets/${filename}`)) {
          refs.push(p.replace(root + path.sep, ''));
        }
      }
    }
  }
  try {
    await walk(root);
  } catch {}
  return refs;
}

export async function GET() {
  await ensureDir();
  const items = await readManifest();
  const withRefs = await Promise.all(
    items.map(async (i) => ({ ...i, refs: await scanRefs(i.filename) }))
  );
  return NextResponse.json(withRefs);
}

export async function POST(req: NextRequest) {
  await ensureDir();
  const form = await req.formData();
  const file = form.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'file required' }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const hash = crypto.createHash('sha1').update(buffer).digest('hex');
  const ext = path.extname(file.name) || '.png';
  const filename = `${hash}${ext}`;
  const filepath = path.join(assetsDir, filename);
  await fs.writeFile(filepath, buffer);
  const img = sharp(buffer);
  const meta = await img.metadata();
  const lqipBuffer = await img
    .resize(20)
    .blur()
    .toBuffer();
  const blur = `data:${file.type};base64,${lqipBuffer.toString('base64')}`;
  const asset: AssetMeta = {
    id: hash,
    filename,
    w: meta.width || 0,
    h: meta.height || 0,
    blurDataUrl: blur,
  };
  const items = await readManifest();
  if (!items.find((i) => i.id === hash)) {
    items.push(asset);
    await writeManifest(items);
  }
  return NextResponse.json(asset);
}

export async function DELETE(req: NextRequest) {
  await ensureDir();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const items = await readManifest();
  const idx = items.findIndex((i) => i.id === id);
  if (idx >= 0) {
    const [removed] = items.splice(idx, 1);
    await writeManifest(items);
    await fs.unlink(path.join(assetsDir, removed.filename)).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
