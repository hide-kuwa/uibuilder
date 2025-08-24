declare module '@/store/editorStore' {
  interface EditorActions {
    snapshotNow(): Promise<void>;
    restoreFromSnapshot(doc: import('@/lib/persist/snapshot').SnapshotDoc): void;
  }
}

