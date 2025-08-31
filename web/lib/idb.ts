const DB_NAME = 'ui-builder'
const DB_VER = 1
const STORE_STATE = 'states'
const STORE_SNAP = 'snapshots'
const STORE_KV = 'kv'

export type BuilderStatePayload = {
  schemaVersion: number
  projectId: string
  updatedAt: number
  data: any
}

export type Snapshot = {
  id: string
  projectId: string
  createdAt: number
  tag?: string
  data: any
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, DB_VER)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_KV)) {
        db.createObjectStore(STORE_KV, { keyPath: 'key' })
      }
      if (!db.objectStoreNames.contains(STORE_STATE)) {
        db.createObjectStore(STORE_STATE, { keyPath: 'projectId' })
      }
      if (!db.objectStoreNames.contains(STORE_SNAP)) {
        const s = db.createObjectStore(STORE_SNAP, { keyPath: 'id' })
        s.createIndex('byProject', 'projectId', { unique: false })
        s.createIndex('byProjectCreated', ['projectId', 'createdAt'], {
          unique: false,
        })
      }
    }
    req.onsuccess = () => res(req.result)
    req.onerror = () => rej(req.error)
  })
}

export async function loadLatest(
  projectId: string,
): Promise<BuilderStatePayload | null> {
  const db = await openDB()
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE_STATE, 'readonly')
    const store = tx.objectStore(STORE_STATE)
    const get = store.get(projectId)
    get.onsuccess = () => res(get.result ?? null)
    get.onerror = () => rej(get.error)
  })
}

export async function saveState(payload: BuilderStatePayload): Promise<void> {
  const db = await openDB()
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE_STATE, 'readwrite')
    const store = tx.objectStore(STORE_STATE)
    store.put(payload)
    tx.oncomplete = () => res()
    tx.onerror = () => rej(tx.error)
  })
}

export async function addSnapshot(s: Snapshot): Promise<void> {
  const db = await openDB()
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE_SNAP, 'readwrite')
    tx.objectStore(STORE_SNAP).put(s)
    tx.oncomplete = () => res()
    tx.onerror = () => rej(tx.error)
  })
}

export async function listSnapshots(projectId: string): Promise<Snapshot[]> {
  const db = await openDB()
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE_SNAP, 'readonly')
    const idx = tx.objectStore(STORE_SNAP).index('byProjectCreated')
    const range = IDBKeyRange.bound(
      [projectId, 0],
      [projectId, Number.MAX_SAFE_INTEGER],
    )
    const out: Snapshot[] = []
    const cur = idx.openCursor(range, 'prev')
    cur.onsuccess = () => {
      const c = cur.result
      if (c) {
        out.push(c.value as Snapshot)
        c.continue()
      } else {
        res(out)
      }
    }
    cur.onerror = () => rej(cur.error)
  })
}

export async function trimSnapshots(
  projectId: string,
  keepLatest: number,
  keepHours: number,
  keepDays: number,
): Promise<void> {
  const snaps = await listSnapshots(projectId)
  const latest = snaps.slice(0, keepLatest)
  const latestIds = new Set(latest.map((s) => s.id))
  const now = Date.now()
  const hourly = new Map<string, Snapshot>()
  const daily = new Map<string, Snapshot>()
  for (const s of snaps) {
    if (latestIds.has(s.id)) continue
    const d = new Date(s.createdAt)
    const hKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`
    const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (now - s.createdAt <= keepHours * 3600_000) {
      if (!hourly.has(hKey)) hourly.set(hKey, s)
    } else if (now - s.createdAt <= keepDays * 86400_000) {
      if (!daily.has(dayKey)) daily.set(dayKey, s)
    }
  }
  const keep = new Set<string>([
    ...latestIds,
    ...Array.from(hourly.values()).map((v) => v.id),
    ...Array.from(daily.values()).map((v) => v.id),
  ])
  const toDelete = snaps.filter((s) => !keep.has(s.id))
  if (!toDelete.length) return
  const db = await openDB()
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE_SNAP, 'readwrite')
    const st = tx.objectStore(STORE_SNAP)
    toDelete.forEach((s) => st.delete(s.id))
    tx.oncomplete = () => res()
    tx.onerror = () => rej(tx.error)
  })
}

export const idbStorage = {
  async getItem(name: string) {
    const db = await openDB()
    return new Promise<string | null>((res, rej) => {
      const tx = db.transaction(STORE_KV, 'readonly')
      const req = tx.objectStore(STORE_KV).get(name)
      req.onsuccess = () => res(req.result?.value ?? null)
      req.onerror = () => rej(req.error)
    })
  },
  async setItem(name: string, value: string) {
    const db = await openDB()
    await new Promise<void>((res, rej) => {
      const tx = db.transaction(STORE_KV, 'readwrite')
      tx.objectStore(STORE_KV).put({ key: name, value })
      tx.oncomplete = () => res()
      tx.onerror = () => rej(tx.error)
    })
  },
  async removeItem(name: string) {
    const db = await openDB()
    await new Promise<void>((res, rej) => {
      const tx = db.transaction(STORE_KV, 'readwrite')
      tx.objectStore(STORE_KV).delete(name)
      tx.oncomplete = () => res()
      tx.onerror = () => rej(tx.error)
    })
  },
}

