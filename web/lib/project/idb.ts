import { openWithVersionFallback } from '../idb'

const DB_NAME = 'ui-builder'
const STORE = 'projects'

async function open(): Promise<IDBDatabase> {
  let db = await openWithVersionFallback(DB_NAME, 1, (db, oldVersion) => {
    if (oldVersion < 1 && !db.objectStoreNames.contains(STORE)) {
      db.createObjectStore(STORE)
    }
  })

  if (db.objectStoreNames.contains(STORE)) {
    return db
  }

  const nextVersion = db.version + 1
  try { db.close() } catch {}
  return openWithVersionFallback(DB_NAME, nextVersion, (upgradeDb) => {
    if (!upgradeDb.objectStoreNames.contains(STORE)) {
      upgradeDb.createObjectStore(STORE)
    }
  })
}

export async function idbSet(key: string, value: any) {
  let db = await open()
  try {
    await new Promise<void>((res, rej) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put(value, key)
      tx.oncomplete = () => res()
      tx.onerror = () => rej(tx.error)
    })
  } catch (e: any) {
    if (e && String(e).includes('NotFoundError')) {
      try { db.close() } catch {}
      db = await open()
      await new Promise<void>((res, rej) => {
        const tx = db.transaction(STORE, 'readwrite')
        tx.objectStore(STORE).put(value, key)
        tx.oncomplete = () => res()
        tx.onerror = () => rej(tx.error)
      })
    } else {
      try { db.close() } catch {}
      throw e
    }
  }
  try { db.close() } catch {}
}

export async function idbGet<T>(key: string): Promise<T | undefined> {
  let db = await open()
  try {
    const out = await new Promise<T | undefined>((res, rej) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).get(key)
      req.onsuccess = () => res(req.result as any)
      req.onerror = () => rej(req.error)
    })
    try { db.close() } catch {}
    return out
  } catch (e: any) {
    if (e && String(e).includes('NotFoundError')) {
      try { db.close() } catch {}
      db = await open()
      const out = await new Promise<T | undefined>((res, rej) => {
        const tx = db.transaction(STORE, 'readonly')
        const req = tx.objectStore(STORE).get(key)
        req.onsuccess = () => res(req.result as any)
        req.onerror = () => rej(req.error)
      })
      try { db.close() } catch {}
      return out
    }
    try { db.close() } catch {}
    throw e
  }
}
