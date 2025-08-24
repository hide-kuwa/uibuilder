import Dexie, { Table } from 'dexie';
import type { AssetMeta } from '@/types/editor';

interface ImageRecord extends AssetMeta {
  blob: Blob;
}

class AssetDB extends Dexie {
  images!: Table<ImageRecord, string>;
  constructor() {
    super('uibuilder-assets');
    this.version(1).stores({ images: '&id,hash' });
  }
}

const db = new AssetDB();

async function sha1(buf: ArrayBuffer) {
  const hash = await crypto.subtle.digest('SHA-1', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function saveImage(file: Blob): Promise<AssetMeta> {
  const buffer = await file.arrayBuffer();
  const hash = await sha1(buffer);
  const existing = await db.images.where('hash').equals(hash).first();
  if (existing) return existing;
  const bitmap = await createImageBitmap(file, {
    imageOrientation: 'from-image',
  } as any);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);
  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b as Blob), file.type),
  );
  const id = crypto.randomUUID();
  const meta: AssetMeta = {
    id,
    mime: file.type,
    w: bitmap.width,
    h: bitmap.height,
    size: blob.size,
    hash,
    createdAt: Date.now(),
    lastUsedAt: Date.now(),
  };
  await db.images.put({ ...meta, blob });
  return meta;
}

export async function saveImageMulti(
  files: Iterable<Blob>,
): Promise<AssetMeta[]> {
  const metas: AssetMeta[] = [];
  for (const f of Array.from(files)) {
    // sequentially process to avoid blocking main thread too much
    const meta = await saveImage(f);
    metas.push(meta);
  }
  return metas;
}

export async function loadImage(id: string): Promise<Blob | null> {
  const row = await db.images.get(id);
  return row ? row.blob : null;
}

export async function hashBlob(blob: Blob): Promise<string> {
  return sha1(await blob.arrayBuffer());
}

export async function listAssets(opts: {
  query?: string;
  sort?: 'newest' | 'oldest' | 'size' | 'used';
} = {}): Promise<AssetMeta[]> {
  const rows = await db.images.toArray();
  let items = rows.map(({ blob, ...meta }) => meta);
  if (opts.query) {
    const q = opts.query.toLowerCase();
    items = items.filter(
      (m) => m.id.toLowerCase().includes(q) || m.hash.includes(q),
    );
  }
  switch (opts.sort) {
    case 'oldest':
      items.sort((a, b) => a.createdAt - b.createdAt);
      break;
    case 'size':
      items.sort((a, b) => b.size - a.size);
      break;
    case 'used':
      items.sort((a, b) => (b.lastUsedAt || 0) - (a.lastUsedAt || 0));
      break;
    default:
      items.sort((a, b) => b.createdAt - a.createdAt);
  }
  return items;
}

export async function duplicates(): Promise<Record<string, AssetMeta[]>> {
  const rows = await db.images.toArray();
  const groups: Record<string, AssetMeta[]> = {};
  rows.forEach(({ blob, ...meta }) => {
    groups[meta.hash] = groups[meta.hash] || [];
    groups[meta.hash].push(meta);
  });
  Object.keys(groups).forEach((h) => {
    if (groups[h].length < 2) delete groups[h];
  });
  return groups;
}

export async function touchAsset(id: string): Promise<void> {
  await db.images.update(id, { lastUsedAt: Date.now() });
}
