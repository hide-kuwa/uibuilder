import Dexie from 'dexie';

class EditorDB extends Dexie {
  data!: Dexie.Table<{ key: string; value: string }, string>;
  constructor() {
    super('uibuilder');
    this.version(1).stores({ data: '&key' });
  }
}

const db = new EditorDB();

export const idbStorage = {
  async getItem(name: string) {
    const row = await db.data.get(name);
    return row?.value ?? null;
  },
  async setItem(name: string, value: string) {
    await db.data.put({ key: name, value });
  },
  async removeItem(name: string) {
    await db.data.delete(name);
  },
};
