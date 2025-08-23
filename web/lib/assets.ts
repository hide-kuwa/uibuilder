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
  };
  await db.images.put({ ...meta, blob });
  return meta;
}

export async function loadImage(id: string): Promise<Blob | null> {
  const row = await db.images.get(id);
  return row ? row.blob : null;
}

export async function hashBlob(blob: Blob): Promise<string> {
  return sha1(await blob.arrayBuffer());
}
