export type SnapshotNode = {
  id: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
};

import type { NodeStatus, StatusConfig } from '@/types/status';

export type Snapshot = {
  nodes: SnapshotNode[];
  statuses: Record<string, NodeStatus>;
  statusConfig: StatusConfig;
  at: number;
};

const KEY = 'snapshots';

export function loadSnapshots(): Snapshot[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Snapshot[];
  } catch {
    return [];
  }
}

export function saveSnapshots(snaps: Snapshot[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(snaps));
  } catch {
    // ignore
  }
}

