import React from 'react';

interface Props {
  onReload: () => void;
  onDisable: () => void;
  onRollback: () => void;
}

export const RecoveryModal: React.FC<Props> = ({ onReload, onDisable, onRollback }) => {
  return (
    <div role="dialog" style={{ padding: 16, border: '1px solid #f00', background: '#fff' }}>
      <p>Something went wrong.</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onDisable}>Disable and continue</button>
        <button onClick={onRollback}>Restore snapshot</button>
        <button onClick={onReload}>Reload</button>
      </div>
    </div>
  );
};
