import { mkdir, writeFile, readdir, readFile } from 'fs/promises';
import path from 'path';

export type ThemeTokens = { [key: string]: any };

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

export type SaveType = 'auto' | 'apply' | 'publish';

export interface StoredSnapshot {
  snapshot: PageSnapshot;
  type: SaveType;
}

export interface SnapshotMeta {
  timestamp: number;
  type: SaveType;
}

const SNAPSHOT_ROOT = path.join(process.cwd(), 'snapshots');

export async function saveSnapshot(pageId: string, snapshot: PageSnapshot, type: SaveType = 'auto'): Promise<SnapshotMeta> {
  const dir = path.join(SNAPSHOT_ROOT, pageId);
  await mkdir(dir, { recursive: true });
  const ts = snapshot.timestamp ?? Date.now();
  const data: StoredSnapshot = { snapshot: { ...snapshot, timestamp: ts }, type };
  const file = path.join(dir, `${ts}.json`);
  await writeFile(file, JSON.stringify(data, null, 2), 'utf8');
  return { timestamp: ts, type };
}

export async function listSnapshots(pageId: string): Promise<SnapshotMeta[]> {
  const dir = path.join(SNAPSHOT_ROOT, pageId);
  try {
    const files = await readdir(dir);
    const metas: SnapshotMeta[] = [];
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      try {
        const text = await readFile(path.join(dir, file), 'utf8');
        const data = JSON.parse(text) as StoredSnapshot;
        metas.push({ timestamp: data.snapshot.timestamp, type: data.type });
      } catch {
        // ignore bad files
      }
    }
    return metas.sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

export async function loadSnapshot(pageId: string, timestamp: number): Promise<StoredSnapshot | null> {
  const file = path.join(SNAPSHOT_ROOT, pageId, `${timestamp}.json`);
  try {
    const text = await readFile(file, 'utf8');
    return JSON.parse(text) as StoredSnapshot;
  } catch {
    return null;
  }
}

export interface DiffResult {
  added: string[];
  removed: string[];
  changed: string[];
}

export function diffSnapshots(a: any, b: any): DiffResult {
  const res: DiffResult = { added: [], removed: [], changed: [] };

  function walk(a: any, b: any, path: string) {
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
      if (JSON.stringify(a) !== JSON.stringify(b)) res.changed.push(path);
      return;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    for (const k of aKeys) {
      const p = path ? `${path}.${k}` : k;
      if (!(k in b)) res.removed.push(p);
      else walk(a[k], b[k], p);
    }
    for (const k of bKeys) {
      const p = path ? `${path}.${k}` : k;
      if (!(k in a)) res.added.push(p);
    }
  }

  walk(a, b, '');
  return res;
}
