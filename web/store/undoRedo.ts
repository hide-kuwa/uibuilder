import { Patch, applyPatches } from 'immer';

interface Entry {
  patches: Patch[];
  inverse: Patch[];
}

const LIMIT = 100;
const past: Entry[] = [];
const future: Entry[] = [];

export function push(patches: Patch[], inverse: Patch[]) {
  past.push({ patches, inverse });
  if (past.length > LIMIT) past.shift();
  future.length = 0;
}

export function undo<T>(state: T): T {
  const entry = past.pop();
  if (!entry) return state;
  future.push(entry);
  return applyPatches(state, entry.inverse);
}

export function redo<T>(state: T): T {
  const entry = future.pop();
  if (!entry) return state;
  past.push(entry);
  return applyPatches(state, entry.patches);
}

export function clear() {
  past.length = 0;
  future.length = 0;
}
