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

/**
 * v12-3: アセットマップ & 重複排除（書き出し連携）
 * - ツリーを走査して画像アセット参照を抽出
 * - ハッシュ（優先: data: のバイト→SHA-256, それ以外は FNV-1a 文字列ハッシュ）で重複をグルーピング
 * - map.json 用の構造を返す
 * 依存追加なし。ブラウザ標準 WebCrypto があれば SHA-256 を使用。
 */

export type AssetRef = {
  /** 参照元ノードID */
  nodeId: string;
  /** 参照属性（例: src / backgroundImage(url)） */
  attr: 'src' | 'backgroundImage';
  /** 画像の参照先。data:URL か http(s) URL を想定 */
  src: string;
};

export type AssetMapItem = {
  hash: string;
  assetIds: string[]; // "nodeId.attr" 形式
  example: string; // 代表 src
};
export type AssetMap = {
  hashAlgorithm: 'sha256' | 'fnv1a-32';
  items: AssetMapItem[];
  stats: { total: number; unique: number; duplicates: number };
};

/** ツリーから画像アセットを抽出 */
export function extractAssetsFromTree(tree: any[]): AssetRef[] {
  const out: AssetRef[] = [];
  traverse(tree, (n: any) => {
    const nodeId = n?.id;
    if (!nodeId) return;
    const p = n?.props ?? {};
    const style = n?.style ?? {};
    // 典型: 画像ノード props.src / imageSrc
    const src = p.src ?? p.imageSrc;
    if (typeof src === 'string' && src) {
      out.push({ nodeId, attr: 'src', src });
    }
    // background-image: url("...") から抽出
    const bg = style.backgroundImage;
    if (typeof bg === 'string') {
      const m = bg.match(/url\((['"]?)(.+?)\1\)/i);
      if (m?.[2]) out.push({ nodeId, attr: 'backgroundImage', src: m[2] });
    }
  });
  return out;
}

/** data:URL → Uint8Array へ（BASE64 のみ対応） */
function dataUrlToBytes(dataUrl: string): Uint8Array | null {
  if (!dataUrl.startsWith('data:')) return null;
  const comma = dataUrl.indexOf(',');
  if (comma < 0) return null;
  const meta = dataUrl.slice(5, comma); // e.g. "image/png;base64"
  const payload = dataUrl.slice(comma + 1);
  if (!/;base64$/i.test(meta)) return null;
  try {
    const bin = atob(payload);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

/** FNV-1a 32bit 文字列ハッシュ（依存なし・安定） */
function fnv1a32(str: string): string {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

async function sha256(bytes: Uint8Array): Promise<string> {
  if (typeof crypto !== 'undefined' && (crypto as any).subtle) {
    const buf = await (crypto as any).subtle.digest('SHA-256', bytes);
    const arr = new Uint8Array(buf);
    return [...arr].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // フォールバック：バイト列を文字列化して FNV-1a
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return fnv1a32(s);
}

/** 単一アセットのハッシュ計算。戻り値: {hash, algo} */
export async function hashAssetRef(a: AssetRef): Promise<{ hash: string; algo: 'sha256' | 'fnv1a-32' }> {
  if (a.src.startsWith('data:')) {
    const bytes = dataUrlToBytes(a.src);
    if (bytes) {
      return { hash: await sha256(bytes), algo: 'sha256' };
    }
  }
  // NOTE: CORS を避けるため、http(s) は URL 文字列を FNV-1a でハッシュ化（MVP）
  return { hash: fnv1a32(a.src), algo: 'fnv1a-32' };
}

/** アセットリストをハッシュでグルーピングして map を返す */
export async function buildAssetMap(assets: AssetRef[]): Promise<AssetMap> {
  const groups = new Map<string, { algo: 'sha256' | 'fnv1a-32'; items: AssetRef[] }>();
  let algo: AssetMap['hashAlgorithm'] = 'sha256';
  for (const a of assets) {
    const { hash, algo: al } = await hashAssetRef(a);
    if (al === 'fnv1a-32') algo = 'fnv1a-32'; // 混在時はフォールバック扱い
    const g = groups.get(hash) ?? { algo: al, items: [] };
    g.items.push(a);
    groups.set(hash, g);
  }
  const items: AssetMapItem[] = [];
  for (const [hash, g] of groups.entries()) {
    items.push({
      hash,
      assetIds: g.items.map((x) => `${x.nodeId}.${x.attr}`),
      example: g.items[0]?.src ?? '',
    });
  }
  const total = assets.length;
  const unique = items.length;
  const duplicates = total - unique;
  return { hashAlgorithm: algo, items: items.sort((a, b) => a.hash.localeCompare(b.hash)), stats: { total, unique, duplicates } };
}

// ========== internal ==========
function traverse(nodes: any[], fn: (n: any) => void) {
  for (const n of nodes ?? []) {
    fn(n);
    const ch = (n as any)?.children;
    if (ch && Array.isArray(ch)) traverse(ch, fn);
  }
}

