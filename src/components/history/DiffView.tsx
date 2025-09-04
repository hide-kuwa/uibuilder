import React from 'react';
import type { DiffResult } from '../../lib/history/snapshots';

interface Props {
  diff: DiffResult;
}

export function DiffView({ diff }: Props) {
  return (
    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
      <h4>Added</h4>
      <ul>
        {diff.added.map((p) => (
          <li key={p} style={{ color: 'green' }}>
            + {p}
          </li>
        ))}
      </ul>
      <h4>Removed</h4>
      <ul>
        {diff.removed.map((p) => (
          <li key={p} style={{ color: 'red' }}>
            - {p}
          </li>
        ))}
      </ul>
      <h4>Changed</h4>
      <ul>
        {diff.changed.map((p) => (
          <li key={p} style={{ color: 'orange' }}>
            ~ {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DiffView;
