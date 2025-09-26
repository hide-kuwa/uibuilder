import { openWithVersionFallback } from '../idb'

const DB_NAME = 'ui_builder_drafts'
const STORE_NAME = 'drafts'


export interface DraftRecord {
  pageId: string
  snapshot: any
  updatedAt: number
}

async function openDB(): Promise<IDBDatabase> {
  return openWithVersionFallback(DB_NAME, 2, (db, oldVersion) => {
    // Keep existing upgrade logic in one place for incremental migrations.
    if (oldVersion < 1 && !db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'pageId' })
    }
    // if (oldVersion < 2) { ... }
  })
}

export async function saveDraft(record: DraftRecord) {
  const db = await openDB()
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(record)
    tx.oncomplete = () => res()
    tx.onerror = () => rej(tx.error)
  })
  db.close()
}

export async function loadDraft(pageId: string): Promise<DraftRecord | undefined> {
  const db = await openDB()
  const out = await new Promise<DraftRecord | undefined>((res, rej) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(pageId)
    req.onsuccess = () => res(req.result as DraftRecord | undefined)
    req.onerror = () => rej(req.error)
  })
  db.close()
  return out
}

export async function clearDraft(pageId: string): Promise<void> {
  const db = await openDB()
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(pageId)
    tx.oncomplete = () => res()
    tx.onerror = () => rej(tx.error)
  })
  db.close()
}
