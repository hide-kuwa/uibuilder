const DB_NAME = "ui-builder";
const STORE = "projects";
function open() {
  return new Promise<IDBDatabase>((res, rej) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };

    request.onsuccess = () => {
      const db = request.result;
      if (db.objectStoreNames.contains(STORE)) {
        res(db);
        return;
      }

      // Handle databases that were created without the required store.
      db.close();
      const fix = indexedDB.open(DB_NAME, db.version + 1);
      fix.onupgradeneeded = () => {
        const upgradeDb = fix.result;
        if (!upgradeDb.objectStoreNames.contains(STORE)) {
          upgradeDb.createObjectStore(STORE);
        }
      };
      fix.onsuccess = () => res(fix.result);
      fix.onerror = () => rej(fix.error);
    };

    request.onerror = () => rej(request.error);
  });
}
export async function idbSet(key: string, value: any) {
  const db = await open();
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
  db.close();
}
export async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await open();
  const out = await new Promise<T | undefined>((res, rej) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => res(req.result as any);
    req.onerror = () => rej(req.error);
  });
  db.close();
  return out;
}
