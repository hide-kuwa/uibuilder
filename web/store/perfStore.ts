import { create } from 'zustand';

export type OpKind =
  | 'select'
  | 'drag'
  | 'resize'
  | 'rotate'
  | 'reorder'
  | 'undo'
  | 'redo'
  | 'autosave'
  | 'render';

export interface OpLogEntry {
  id: string;
  t: number;
  kind: OpKind;
  detail?: any;
  durMs?: number;
  frameMs?: number;
  patches?: number;
  nodesAffected?: number;
}

interface PerfState {
  fps: number;
  commitMs: number[];
  logs: OpLogEntry[];
  setFPS: (fps: number) => void;
  addCommit: (ms: number) => void;
  addLog: (entry: OpLogEntry) => void;
}

export const usePerfStore = create<PerfState>()((set) => ({
  fps: 0,
  commitMs: [],
  logs: [],
  setFPS: (fps) => set({ fps }),
  addCommit: (ms) =>
    set((s) => ({ commitMs: [...s.commitMs.slice(-59), ms] })),
  addLog: (entry) => set((s) => ({ logs: [...s.logs, entry] })),
}));
