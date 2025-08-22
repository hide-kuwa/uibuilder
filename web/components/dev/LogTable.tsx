'use client';
import { usePerfStore } from '@/store/perfStore';

export default function LogTable() {
  const logs = usePerfStore((s) => s.logs);
  if (!logs.length) return <p>No logs</p>;
  return (
    <table className="text-xs">
      <thead>
        <tr>
          <th className="px-1">time</th>
          <th className="px-1">kind</th>
          <th className="px-1">dur(ms)</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((l) => (
          <tr key={l.id}>
            <td className="px-1">{new Date(l.t).toLocaleTimeString()}</td>
            <td className="px-1">{l.kind}</td>
            <td className="px-1">{l.durMs?.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
