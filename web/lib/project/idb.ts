const DB_NAME = 'ui-builder'
const STORE = 'projects'
function open() {
  return new Promise<IDBDatabase>((res, rej) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
    }
    req.onsuccess = () => res(req.result)
    req.onerror = () => rej(req.error)
  })
}
export async function idbSet(key: string, value: any) {
  const db = await open()
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(value, key)
    tx.oncomplete = () => res()
    tx.onerror = () => rej(tx.error)
  })
  db.close()
}
export async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await open()
  const out = await new Promise<T | undefined>((res, rej) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(key)
    req.onsuccess = () => res(req.result as any)
    req.onerror = () => rej(req.error)
  })
  db.close()
  return out
}
