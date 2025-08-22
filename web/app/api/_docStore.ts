import type { Operation } from '@/types/sync';

interface DocEntry {
  rev: number;
  ops: Operation[];
  state: any;
}

export const store: Record<string, DocEntry> = {};
