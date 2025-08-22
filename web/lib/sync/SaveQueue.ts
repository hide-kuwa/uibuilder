import { create } from 'zustand';
import { db } from './idb';
import type { Patch, Operation, Envelope, ServerReply } from '@/types/sync';

export type SyncStatus = 'saved' | 'syncing' | 'offline';

interface SyncState {
  status: SyncStatus;
  lastSync: number | null;
}

export const useSyncStatus = create<SyncState>(() => ({
  status: typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'saved',
  lastSync: null,
}));

function uuid() {
  return (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export class SaveQueue {
  private docId: string;
  private clientId: string;
  private sessionId: string;
  private timer: any = null;
  private sending = false;
  private backoff = 1000;

  constructor(docId: string) {
    this.docId = docId;
    this.clientId = localStorage.getItem('clientId') || uuid();
    localStorage.setItem('clientId', this.clientId);
    this.sessionId = uuid();
    if (db) {
      window.addEventListener('online', () => this.scheduleFlush());
      window.addEventListener('offline', () => useSyncStatus.setState({ status: 'offline' }));
    }
  }

  async record(patches: Patch[], state: any, baseRev: number) {
    if (!db) return;
    const op: Operation = {
      id: uuid(),
      docId: this.docId,
      clientId: this.clientId,
      sessionId: this.sessionId,
      baseRev,
      patches,
      ts: Date.now(),
    };
    await db.transaction('rw', db.ops, db.draft, async () => {
      await db.ops.put(op);
      await db.draft.put({ docId: this.docId, state, updatedAt: Date.now() });
    });
    this.scheduleFlush();
  }

  private scheduleFlush() {
    if (!db || !navigator.onLine) {
      useSyncStatus.setState({ status: 'offline' });
      return;
    }
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), 500);
  }

  private async flush() {
    if (!db || this.sending) return;
    const ops = await db.ops.orderBy('ts').toArray();
    if (ops.length === 0) {
      useSyncStatus.setState({ status: 'saved' });
      return;
    }
    const meta = await db.meta.get(this.docId);
    const envelope: Envelope = {
      docId: this.docId,
      clientId: this.clientId,
      lastAckRev: meta?.lastAckRev || 0,
      ops,
    };
    this.sending = true;
    useSyncStatus.setState({ status: 'syncing' });
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(envelope),
      });
      if (!res.ok) throw new Error('sync failed');
      const reply: ServerReply = await res.json();
      await db.transaction('rw', db.ops, db.meta, async () => {
        await Promise.all(reply.accepted.map((id) => db.ops.delete(id)));
        await db.meta.put({
          docId: this.docId,
          clientId: this.clientId,
          sessionId: this.sessionId,
          lastAckRev: reply.headRev,
        });
      });
      useSyncStatus.setState({ status: 'saved', lastSync: Date.now() });
      this.backoff = 1000;
    } catch (err) {
      useSyncStatus.setState({ status: 'offline' });
      this.backoff = Math.min(this.backoff * 2, 30000);
      setTimeout(() => this.flush(), this.backoff);
    } finally {
      this.sending = false;
    }
  }
}
