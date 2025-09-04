'use client';
import React from 'react';

export default function LogsPage() {
  const [logs, setLogs] = React.useState<any[]>([]);
  React.useEffect(() => {
    const l = (window as any).__DEV_LOGS__ || [];
    setLogs(l);
  }, []);
  return (
    <div style={{ padding: 16 }}>
      <h1>/dev/logs</h1>
      {logs.length === 0 ? (
        <p>No logs</p>
      ) : (
        <ul>
          {logs.map((log, idx) => (
            <li key={idx} style={{ marginBottom: 8 }}>
              <pre>{log.message}</pre>
              {log.stack && <pre>{log.stack}</pre>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
