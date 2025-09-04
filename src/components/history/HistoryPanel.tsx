import React, { useEffect, useState } from 'react';
import {
  listSnapshots,
  loadSnapshot,
  diffSnapshots,
  type SnapshotMeta,
  type StoredSnapshot,
  type PageSnapshot,
} from '../../lib/history/snapshots';
import DiffView from './DiffView';

interface Props {
  pageId: string;
  onRestore: (snap: PageSnapshot) => void;
}

export function HistoryPanel({ pageId, onRestore }: Props) {
  const [items, setItems] = useState<SnapshotMeta[]>([]);
  const [selected, setSelected] = useState<SnapshotMeta[]>([]);
  const [loaded, setLoaded] = useState<StoredSnapshot[]>([]);
  const [diff, setDiff] = useState<any>(null);

  useEffect(() => {
    listSnapshots(pageId).then(setItems);
  }, [pageId]);

  const toggle = async (meta: SnapshotMeta) => {
    let next = selected.find((m) => m.timestamp === meta.timestamp)
      ? selected.filter((m) => m.timestamp !== meta.timestamp)
      : [...selected, meta].slice(-2);
    setSelected(next);
    if (next.length === 2) {
      const a = await loadSnapshot(pageId, next[0].timestamp);
      const b = await loadSnapshot(pageId, next[1].timestamp);
      if (a && b) {
        setLoaded([a, b]);
        setDiff(diffSnapshots(a.snapshot, b.snapshot));
      }
    } else {
      setDiff(null);
      setLoaded([]);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        bottom: 0,
        width: 300,
        background: '#fff',
        border: '1px solid #ccc',
        padding: '0.5rem',
        fontSize: '0.8rem',
      }}
    >
      <h3>History</h3>
      <ul style={{ listStyle: 'none', padding: 0, maxHeight: 200, overflow: 'auto' }}>
        {items.map((m) => (
          <li
            key={m.timestamp}
            onClick={() => toggle(m)}
            style={{
              cursor: 'pointer',
              background: selected.some((s) => s.timestamp === m.timestamp)
                ? '#eee'
                : 'transparent',
              padding: '0.25rem',
            }}
          >
            {new Date(m.timestamp).toLocaleTimeString()} [{m.type}]
          </li>
        ))}
      </ul>
      {diff && loaded.length === 2 && (
        <div>
          <DiffView diff={diff} />
          <button onClick={() => onRestore(loaded[0].snapshot)}>
            Restore first
          </button>
          <button onClick={() => onRestore(loaded[1].snapshot)}>
            Restore second
          </button>
        </div>
      )}
    </div>
  );
}

export default HistoryPanel;
