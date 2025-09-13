import Dexie, { type Table } from "dexie";

export type SnapshotDoc = {
  tree: any[];
  components: Record<string, any>;
  prototypeLinks: Record<string, any>;
};

type SnapshotRow = {
  id?: number;
  ts: number;
  enc: "raw" | "gzip";
  data: Uint8Array;
};

class SnapshotDB extends Dexie {
  snapshots!: Table<SnapshotRow, number>;
  constructor() {
    super("ui_builder_snapshots_v1");
    this.version(1).stores({
      snapshots: "++id, ts",
    });
  }
}

const db = new SnapshotDB();

let staged: { doc: SnapshotDoc; ts: number } | null = null;
let flushHandle: any = null;
const IDLE_TIMEOUT = 1000;

function scheduleFlush() {
  if (flushHandle != null) {
    try {
      if (typeof (globalThis as any).cancelIdleCallback === "function") {
        (globalThis as any).cancelIdleCallback(flushHandle);
      } else {
        clearTimeout(flushHandle);
      }
    } catch {}
  }
  const cb = () => {
    flushHandle = null;
    flushStagedSnapshot().catch(() => {});
  };
  if (typeof (globalThis as any).requestIdleCallback === "function") {
    flushHandle = (globalThis as any).requestIdleCallback(cb, { timeout: IDLE_TIMEOUT });
  } else {
    flushHandle = setTimeout(cb, IDLE_TIMEOUT);
  }
}

async function commitSnapshot(doc: SnapshotDoc, ts: number) {
  const payload = { v: 1, ts, doc };
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const compressed = await tryGzip(bytes);
  const row: SnapshotRow = {
    ts,
    enc: compressed ? "gzip" : "raw",
    data: compressed ?? bytes,
  };
  await db.snapshots.add(row);
  try {
    const all = await db.snapshots.orderBy("ts").toArray();
    const excess = Math.max(0, all.length - 5);
    for (let i = 0; i < excess; i++) await db.snapshots.delete(all[i].id!);
  } catch {}
  try {
    localStorage.setItem("ui.snapshot.latestTs", String(ts));
  } catch {}
}

export async function flushStagedSnapshot(): Promise<void> {
  if (flushHandle != null) {
    try {
      if (typeof (globalThis as any).cancelIdleCallback === "function") {
        (globalThis as any).cancelIdleCallback(flushHandle);
      } else {
        clearTimeout(flushHandle);
      }
    } catch {}
    flushHandle = null;
  }
  if (!staged) return;
  const { doc, ts } = staged;
  staged = null;
  await commitSnapshot(doc, ts);
}

export async function saveLatestSnapshot(doc: SnapshotDoc): Promise<number> {
  const ts = Date.now();
  staged = { doc, ts };
  scheduleFlush();
  return ts;
}

if (typeof window !== "undefined") {
  const onHide = () => {
    flushStagedSnapshot().catch(() => {});
  };
  window.addEventListener("pagehide", onHide);
  window.addEventListener("beforeunload", onHide);
}

export async function loadLatestSnapshot(): Promise<
  { ts: number; doc: SnapshotDoc } | null
> {
  const row = await db.snapshots.orderBy("ts").last();
  if (!row) return null;
  const bytes = row.enc === "gzip" ? await tryGunzip(row.data) : row.data;
  const json = new TextDecoder().decode(bytes);
  const payload = JSON.parse(json);
  return { ts: payload.ts, doc: payload.doc as SnapshotDoc };
}

export async function hasAnySnapshot(): Promise<boolean> {
  try {
    const c = await db.snapshots.count();
    return c > 0;
  } catch {
    return false;
  }
}

const SESSION_KEY = "ui.session.alive";
export function markSessionAlive() {
  try {
    localStorage.setItem(SESSION_KEY, "1");
  } catch {}
}
export function clearSessionAlive() {
  try {
    localStorage.setItem(SESSION_KEY, "0");
  } catch {}
}
export function wasPreviousSessionCrashed(): boolean {
  try {
    const v = localStorage.getItem(SESSION_KEY);
    return v === "1";
  } catch {
    return false;
  }
}

async function tryGzip(bytes: Uint8Array): Promise<Uint8Array | null> {
  if (typeof (globalThis as any).CompressionStream === "undefined") return null;
  try {
    const cs = new (globalThis as any).CompressionStream("gzip");
    const w = cs.writable.getWriter();
    await w.write(bytes);
    await w.close();
    const buf = await new Response(cs.readable).arrayBuffer();
    return new Uint8Array(buf);
  } catch {
    return null;
  }
}

async function tryGunzip(bytes: Uint8Array): Promise<Uint8Array> {
  if (typeof (globalThis as any).DecompressionStream === "undefined") return bytes;
  try {
    const ds = new (globalThis as any).DecompressionStream("gzip");
    const w = ds.writable.getWriter();
    await w.write(bytes);
    await w.close();
    const buf = await new Response(ds.readable).arrayBuffer();
    return new Uint8Array(buf);
  } catch {
    return bytes;
  }
}

