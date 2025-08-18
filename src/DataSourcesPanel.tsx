import React, { useState } from 'react';
import { useDataSources, DataSource } from './dataSources';

const emptySource: DataSource = { name: '', baseURL: '', headers: {}, token: '' };

const DataSourcesPanel: React.FC = () => {
  const { sources, setSources } = useDataSources();
  const [tests, setTests] = useState<Record<number, string>>({});

  const updateSource = (idx: number, field: keyof DataSource, value: any) => {
    setSources((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  };

  const removeSource = (idx: number) => {
    setSources((prev) => prev.filter((_, i) => i !== idx));
  };

  const addSource = () => setSources((prev) => [...prev, { ...emptySource }]);

  const testSource = async (idx: number) => {
    const src = sources[idx];
    if (!src) return;
    try {
      const headers: Record<string, string> = { ...(src.headers || {}) };
      if (src.token) headers['Authorization'] = `Bearer ${src.token}`;
      const res = await fetch(src.baseURL, { headers });
      setTests((t) => ({ ...t, [idx]: res.ok ? 'success' : `error ${res.status}` }));
    } catch (err: any) {
      setTests((t) => ({ ...t, [idx]: 'error' }));
    }
  };

  return (
    <div className="p-2 space-y-4">
      {sources.map((src, idx) => (
        <div key={idx} className="border rounded p-2 space-y-2">
          <div className="flex space-x-2">
            <input
              className="flex-1 border rounded px-2 py-1"
              placeholder="Name"
              value={src.name}
              onChange={(e) => updateSource(idx, 'name', e.target.value)}
            />
            <button
              className="text-red-500 text-sm"
              onClick={() => removeSource(idx)}
            >
              Remove
            </button>
          </div>
          <input
            className="w-full border rounded px-2 py-1"
            placeholder="Base URL"
            value={src.baseURL}
            onChange={(e) => updateSource(idx, 'baseURL', e.target.value)}
          />
          <textarea
            className="w-full border rounded px-2 py-1 text-sm"
            placeholder="Headers (JSON)"
            value={JSON.stringify(src.headers || {})}
            onChange={(e) => {
              try {
                const val = JSON.parse(e.target.value || '{}');
                updateSource(idx, 'headers', val);
              } catch {
                // ignore parse errors
              }
            }}
          />
          <input
            className="w-full border rounded px-2 py-1"
            placeholder="Bearer Token"
            value={src.token || ''}
            onChange={(e) => updateSource(idx, 'token', e.target.value)}
          />
          <button
            className="px-2 py-1 bg-blue-500 text-white rounded"
            onClick={() => testSource(idx)}
          >
            Test connection
          </button>
          {tests[idx] && (
            <div className="text-sm">
              {tests[idx] === 'success' ? (
                <span className="text-green-600">Connection OK</span>
              ) : (
                <span className="text-red-600">Connection failed</span>
              )}
            </div>
          )}
        </div>
      ))}
      <button
        className="px-2 py-1 bg-green-500 text-white rounded"
        onClick={addSource}
      >
        Add Source
      </button>
    </div>
  );
};

export default DataSourcesPanel;

