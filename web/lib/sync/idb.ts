import Dexie, { Table } from 'dexie';
import type { Operation } from '@/types/sync';

export interface Draft { docId: string; state: any; updatedAt: number }
export interface Snapshot { docId: string; rev: number; state: any; at: number }
export interface Meta { docId: string; lastAckRev: number; clientId: string; sessionId: string }

class SyncDB extends Dexie {
  draft!: Table<Draft, string>;
  ops!: Table<Operation, string>;
  snapshots!: Table<Snapshot, [string, number]>;
  meta!: Table<Meta, string>;

  constructor() {
    super('uibuilder-sync');
    this.version(1).stores({
      draft: '&docId',
      ops: '&id, docId, baseRev',
      snapshots: '[docId+rev]',
      meta: '&docId',
    });
  }
}

export const db: SyncDB | undefined =
  typeof indexedDB !== 'undefined' ? new SyncDB() : undefined;
