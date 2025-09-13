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

// Crash-safe staging keys (synchronous, cross-browser best-effort)
const STAGING_KEY = 'figma-doc:staged'
const STAGING_TS_KEY = 'figma-doc:staged:ts'
const STAGING_MAX_BYTES = 1_000_000 // ~1MB safety cap
const STAGING_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
const STAGING_MIN_INTERVAL_MS = 300 // throttle frequent staging
let lastStageJson = ''
let lastStageTs = 0

let staged: { doc: SnapshotDoc; ts: number } | null = null
let flushTimer: any = null
let flushInFlight = false
let lastCommittedTs = 0

// Optional multi-tab fast-path using BroadcastChannel
let bc: BroadcastChannel | null = null
try {
  // Safari 16+ / Chromium / Firefox support; older environments will throw
  bc = new BroadcastChannel('persist:snapshot')
  bc.addEventListener('message', (ev: MessageEvent) => {
    const m = ev.data as { type: 'staged'; ts: number; doc?: SnapshotDoc } | undefined
    if (!m || m.type !== 'staged' || !Number.isFinite(m.ts)) return
    // Adopt newer staged from other tabs without forcing localStorage writes
    if (!staged || m.ts > staged.ts) {
      if (m.doc) {
        staged = { doc: m.doc, ts: m.ts }
      } else {
        // Payload omitted: pull from local/session storage if available
        const json = (typeof localStorage !== 'undefined' ? localStorage.getItem(STAGING_KEY) : null)
          ?? (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(STAGING_KEY) : null)
        if (json) {
          try { staged = { doc: JSON.parse(json) as SnapshotDoc, ts: m.ts } } catch {}
        }
      }
    }
  })
} catch { /* BroadcastChannel unsupported */ }

function isQuotaExceeded(e: any) {
  return (
    e?.name === 'QuotaExceededError' ||
    e?.code === 22 || e?.code === 1014 ||
    String(e).includes('QuotaExceededError')
  )
}

function stageSync(doc: SnapshotDoc, ts: number, opts?: { force?: boolean }) {
  try {
    const force = !!opts?.force
    const json = JSON.stringify(doc)
    if (!force) {
      if (json === lastStageJson && ts - lastStageTs < STAGING_MIN_INTERVAL_MS) return
    }
    lastStageJson = json; lastStageTs = ts

    if (json.length > STAGING_MAX_BYTES) {
      // too large: store only timestamp
      localStorage.setItem(STAGING_TS_KEY, String(ts))
      return
    }
    localStorage.setItem(STAGING_KEY, json)
    localStorage.setItem(STAGING_TS_KEY, String(ts))
  } catch (e) {
    if (!isQuotaExceeded(e)) return
    try {
      sessionStorage.setItem(STAGING_KEY, JSON.stringify(doc))
      sessionStorage.setItem(STAGING_TS_KEY, String(ts))
    } catch {}
  }
}

function clearStaged() {
  try { localStorage.removeItem(STAGING_KEY); localStorage.removeItem(STAGING_TS_KEY) } catch {}
  try { sessionStorage.removeItem(STAGING_KEY); sessionStorage.removeItem(STAGING_TS_KEY) } catch {}
}

function scheduleFlush() {
  if (flushTimer) clearTimeout(flushTimer)
  // defer to keep UI responsive; durable write will occur shortly
  flushTimer = setTimeout(() => { void flushStagedSnapshot() }, 300)
}

async function putDexie(doc: SnapshotDoc, ts: number) {
  const payload = { v: 1, ts, doc }
  const bytes = new TextEncoder().encode(JSON.stringify(payload))
  const compressed = await tryGzip(bytes)
  const row: SnapshotRow = {
    ts,
    enc: compressed ? 'gzip' as const : 'raw',
    data: compressed ?? bytes,
  }
  await db.snapshots.add(row)
  try {
    const all = await db.snapshots.orderBy('ts').toArray()
    const excess = Math.max(0, all.length - 5)
    for (let i = 0; i < excess; i++) await db.snapshots.delete(all[i].id!)
  } catch {}
  try { localStorage.setItem('ui.snapshot.latestTs', String(ts)) } catch {}
}

export async function getLastIndexedTs(): Promise<number> {
  try {
    const last = await db.snapshots.orderBy('ts').last()
    return last?.ts ?? 0
  } catch { return 0 }
}

export async function putToIndexedDb(doc: SnapshotDoc, ts: number) {
  await putDexie(doc, ts)
}

export async function rehydrateFromStagedIfNewer(
  getTs: () => Promise<number> = getLastIndexedTs,
  putFn: (doc: SnapshotDoc, ts:number) => Promise<void> = putToIndexedDb,
) {
  try {
    const stagedJson = (typeof localStorage !== 'undefined' ? localStorage.getItem(STAGING_KEY) : null)
      ?? (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(STAGING_KEY) : null)
    const stagedTsStr = (typeof localStorage !== 'undefined' ? localStorage.getItem(STAGING_TS_KEY) : null)
      ?? (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(STAGING_TS_KEY) : null)
    if (!stagedJson || !stagedTsStr) return
    const stagedTs = Number(stagedTsStr)
    if (!Number.isFinite(stagedTs)) { clearStaged(); return }
    const now = Date.now()
    if (now - stagedTs > STAGING_TTL_MS) { clearStaged(); return }
    const lastTs = await getTs().catch(() => 0)
    if (stagedTs > (lastTs || 0)) {
      try {
        const doc = JSON.parse(stagedJson) as SnapshotDoc
        await putFn(doc, stagedTs)
      } catch {}
    }
  } finally {
    clearStaged()
  }
}

async function flushStagedSnapshot(): Promise<void> {
  if (!staged || flushInFlight) return
  flushInFlight = true
  const { doc, ts } = staged
  try {
    if (ts <= lastCommittedTs) return
    await putDexie(doc, ts)
    lastCommittedTs = ts
    clearStaged()
  } finally {
    flushInFlight = false
  }
}

function broadcastStaged(ts: number, doc?: SnapshotDoc) {
  try { bc?.postMessage({ type: 'staged', ts, doc }) } catch {}
}

export async function saveLatestSnapshot(doc: SnapshotDoc): Promise<number> {
  const ts = Date.now()
  staged = { doc, ts }
  // Notify other tabs via BroadcastChannel (omit payload for minimal cost).
  // Receivers may pull from storage if needed.
  broadcastStaged(ts, undefined)
  // Sync stage to survive abrupt closes (teardown tolerance)
  try { stageSync(doc, ts) } catch {}
  // Dexie write remains deferred under normal path
  scheduleFlush()
  return ts
}

// Runtime recovery hints for error-boundary restore flows
if (typeof window !== 'undefined') {
  try {
    const g = (window as any)
    g.__snapshot = g.__snapshot || {}
    Object.defineProperty(g.__snapshot, 'lastCommittedTs', {
      get: () => lastCommittedTs,
      configurable: true,
    })
    g.__snapshot.rehydrateLatestFromStage = async () => {
      try {
        await rehydrateFromStagedIfNewer(getLastIndexedTs, putToIndexedDb)
      } catch {}
    }
  } catch {}
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

// Install staging listeners in browser contexts
if (typeof window !== 'undefined') {
  const onHideLike = () => {
    try { if (staged) stageSync(staged.doc, staged.ts, { force: true }) } catch {}
  }
  window.addEventListener('pagehide', onHideLike)
  window.addEventListener('beforeunload', onHideLike)
  document.addEventListener?.('visibilitychange', () => {
    if (document.visibilityState === 'hidden') onHideLike()
  })
  // @ts-expect-error freeze is experimental in some browsers
  document.addEventListener?.('freeze', onHideLike)

  // Multi-tab coordination: adopt newer staged payloads from other tabs
  window.addEventListener('storage', (ev) => {
    if (ev.key !== STAGING_TS_KEY) return
    const ts = Number(ev.newValue)
    if (!Number.isFinite(ts)) return
    const json = (typeof localStorage !== 'undefined' ? localStorage.getItem(STAGING_KEY) : null)
      ?? (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(STAGING_KEY) : null)
    if (!json) return
    if (!staged || ts > staged.ts) {
      try { staged = { doc: JSON.parse(json) as SnapshotDoc, ts } } catch {}
    }
  })
}
