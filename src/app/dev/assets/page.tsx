'use client';

import React, { useEffect, useState, DragEvent } from 'react';

interface AssetMeta {
  id: string;
  filename: string;
  w: number;
  h: number;
  blurDataUrl: string;
  refs?: string[];
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<AssetMeta[]>([]);
  const [query, setQuery] = useState('');

  const load = () => {
    fetch('/api/assets')
      .then((r) => r.json())
      .then(setAssets);
  };

  useEffect(() => {
    load();
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files)) {
      const form = new FormData();
      form.append('file', f);
      await fetch('/api/assets', { method: 'POST', body: form });
    }
    load();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/assets?id=${id}`, { method: 'DELETE' });
    load();
  };

  const filtered = assets.filter(
    (a) =>
      a.id.includes(query) ||
      a.filename.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">/dev/assets</h1>
      <input
        type="text"
        placeholder="Search"
        className="border px-2 py-1"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div
        className="border-dashed border-2 p-10 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        Drag & drop images here or
        <input
          type="file"
          multiple
          className="ml-2"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {filtered.map((a) => (
          <div key={a.id} className="border p-2 space-y-2">
            <img src={a.blurDataUrl} alt="thumb" className="w-full" />
            <div className="text-xs break-all">{a.filename}</div>
            <div className="text-xs text-gray-500">
              {a.w}x{a.h} / refs: {a.refs?.length || 0}
            </div>
            <button
              className="text-red-600 text-xs"
              onClick={() => handleDelete(a.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

