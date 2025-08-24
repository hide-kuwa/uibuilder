import Dexie, { type Table } from 'dexie';

type ComponentMeta = {
  id: string;
  usageCount: number;
  lastUsedAt: number;
};

class UIBDb extends Dexie {
  componentsMeta!: Table<ComponentMeta, string>;
  constructor() {
    super('uiBuilder');
    this.version(1).stores({
      componentsMeta: 'id',
    });
  }
}

const db = new UIBDb();

export async function loadComponentsMeta(): Promise<
  Record<string, { usageCount: number; lastUsedAt: number }>
> {
  try {
    const rows = await db.componentsMeta.toArray();
    const out: Record<string, { usageCount: number; lastUsedAt: number }> = {};
    for (const r of rows) out[r.id] = { usageCount: r.usageCount, lastUsedAt: r.lastUsedAt };
    return out;
  } catch {
    return {};
  }
}

export async function bumpComponentUsage(id: string) {
  const now = Date.now();
  const cur = await db.componentsMeta.get(id);
  const next: ComponentMeta = {
    id,
    usageCount: (cur?.usageCount ?? 0) + 1,
    lastUsedAt: now,
  };
  await db.componentsMeta.put(next);
  return next;
}

export async function writeComponentMeta(
  id: string,
  meta: Partial<Omit<ComponentMeta, 'id'>>,
) {
  const cur = await db.componentsMeta.get(id);
  const next: ComponentMeta = {
    id,
    usageCount: meta.usageCount ?? cur?.usageCount ?? 0,
    lastUsedAt: meta.lastUsedAt ?? cur?.lastUsedAt ?? 0,
  };
  await db.componentsMeta.put(next);
  return next;
}
