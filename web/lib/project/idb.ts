const DB_NAME = "ui-builder";
const STORE = "projects";
function open() {
  return new Promise<IDBDatabase>((res, rej) => {
    // Open without version to avoid VersionError when a higher version already exists
    const request = indexedDB.open(DB_NAME);

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
      fix.onblocked = () => {
        // If blocked, still fail gracefully so callers can retry later
        try { fix.result?.close?.() } catch {}
        rej(new Error('IndexedDB upgrade blocked'))
      }
    };

    request.onerror = () => {
      // If VersionError occurs because of version mismatch, retry without version
      const err = request.error as any
      if (err && String(err.name || err).includes('VersionError')) {
        try { request.result?.close?.() } catch {}
        const retry = indexedDB.open(DB_NAME)
        retry.onsuccess = () => res(retry.result)
        retry.onerror = () => rej(retry.error)
        return
      }
      rej(request.error)
    };
    request.onblocked = () => {
      try { request.result?.close?.() } catch {}
      rej(new Error('IndexedDB open blocked'))
    }
  });
}
export async function idbSet(key: string, value: any) {
  let db = await open();
  try {
    await new Promise<void>((res, rej) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch (e: any) {
    // Retry once if store missing due to race
    if (e && String(e).includes('NotFoundError')) {
      try { db.close() } catch {}
      db = await open()
      await new Promise<void>((res, rej) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(value, key);
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
    } else {
      try { db.close() } catch {}
      throw e
    }
  }
  try { db.close() } catch {}
}
export async function idbGet<T>(key: string): Promise<T | undefined> {
  let db = await open();
  try {
    const out = await new Promise<T | undefined>((res, rej) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => res(req.result as any);
      req.onerror = () => rej(req.error);
    });
    try { db.close() } catch {}
    return out;
  } catch (e: any) {
    if (e && String(e).includes('NotFoundError')) {
      try { db.close() } catch {}
      db = await open();
      const out = await new Promise<T | undefined>((res, rej) => {
        const tx = db.transaction(STORE, "readonly");
        const req = tx.objectStore(STORE).get(key);
        req.onsuccess = () => res(req.result as any);
        req.onerror = () => rej(req.error);
      });
      try { db.close() } catch {}
      return out;
    } else {
      try { db.close() } catch {}
      throw e
    }
  }
}
