'use client';

import React, { useEffect, useState } from 'react';

export interface AssetMeta {
  id: string;
  filename: string;
  w: number;
  h: number;
  blurDataUrl: string;
}

interface Props {
  value?: AssetMeta;
  onSelect: (asset: AssetMeta) => void;
}

const AssetPicker: React.FC<Props> = ({ value, onSelect }) => {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<AssetMeta[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    fetch('/api/assets')
      .then((r) => r.json())
      .then(setAssets);
  }, [open]);

  const filtered = assets.filter(
    (a) =>
      a.id.includes(query) ||
      a.filename.toLowerCase().includes(query.toLowerCase()),
  );

  const handleFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const form = new FormData();
    form.append('file', files[0]);
    const res = await fetch('/api/assets', { method: 'POST', body: form });
    const asset = await res.json();
    setAssets((prev) => [asset, ...prev]);
  };

  return (
    <div className="space-y-2">
      <button
        className="border rounded px-2 py-1 text-sm"
        onClick={() => setOpen(true)}
      >
        {value ? 'Change asset' : 'Select asset'}
      </button>
      {value && (
        <img
          src={`/assets/${value.filename}`}
          alt="preview"
          className="max-h-32"
        />
      )}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-4 w-[600px] h-[400px] flex flex-col space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Search"
                className="border px-2 py-1 flex-1"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <input type="file" onChange={(e) => handleFile(e.target.files)} />
            </div>
            <div className="grid grid-cols-4 gap-2 overflow-auto flex-1">
              {filtered.map((a) => (
                <img
                  key={a.id}
                  src={a.blurDataUrl}
                  data-full={`/assets/${a.filename}`}
                  className="w-full h-auto cursor-pointer"
                  onClick={() => {
                    onSelect(a);
                    setOpen(false);
                  }}
                />
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="border px-2 py-1 text-sm"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetPicker;
