'use client';
import LogTable from '@/components/dev/LogTable';
import { usePerfStore } from '@/store/perfStore';

export default function MetricsPage() {
  const logs = usePerfStore((s) => s.logs);
  const exportJson = () => {
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'oplog.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="p-4">
      <h1 className="text-lg mb-2">Metrics</h1>
      <button className="mb-2 px-2 py-1 border" onClick={exportJson}>
        Download JSON
      </button>
      <LogTable />
    </div>
  );
}
