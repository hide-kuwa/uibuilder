'use client';
import { useEffect, useState } from 'react';
import type { AssetMeta } from '@/types/editor';
import { listAssets, loadImage, duplicates, touchAsset } from '@/lib/assets';
import { useEditorStore } from '@/store/editorStore';

interface Props {
  onClose: () => void;
}

export default function AssetBrowser({ onClose }: Props) {
  const [items, setItems] = useState<AssetMeta[]>([]);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'size' | 'used'>('newest');
  const [dups, setDups] = useState<Record<string, AssetMeta[]>>({});
  const [hashFilter, setHashFilter] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const q = hashFilter || query;
      const list = await listAssets({ query: q, sort });
      setItems(list);
      const dup = await duplicates();
      setDups(dup);
    };
    run();
  }, [query, sort, hashFilter]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const entries = await Promise.all(
        items.map(async (m) => {
          const blob = await loadImage(m.id);
          return [m.id, URL.createObjectURL(blob!)] as const;
        })
      );
      if (cancelled) return;
      const map: Record<string, string> = {};
      entries.forEach(([id, url]) => (map[id] = url));
      setThumbs(map);
    };
    load();
    return () => {
      cancelled = true;
      Object.values(thumbs).forEach((u) => URL.revokeObjectURL(u));
      setThumbs({});
    };
  }, [items]);

  const select = async (meta: AssetMeta) => {
    const next = { ...meta, lastUsedAt: Date.now() };
    useEditorStore.getState().addImageNode(next);
    await touchAsset(meta.id);
    onClose();
  };

  const dupCount = (hash: string) => dups[hash]?.length || 0;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex flex-col">
      <div className="p-2 bg-white flex items-center gap-2">
        <input
          className="border px-2 py-1 flex-1"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="border px-1 py-1 text-sm"
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="size">Size</option>
          <option value="used">Last used</option>
        </select>
        {hashFilter && (
          <button
            className="border px-2 py-1 text-sm"
            onClick={() => setHashFilter(null)}
          >
            Back
          </button>
        )}
        <button className="ml-auto border px-2 py-1" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 bg-white grid grid-cols-4 gap-4">
        {items.map((m) => (
          <div
            key={m.id}
            className="relative border rounded overflow-hidden cursor-pointer"
            onClick={() => select(m)}
          >
            {thumbs[m.id] && (
              <img src={thumbs[m.id]} className="w-full h-full object-cover" />
            )}
            {dupCount(m.hash) > 1 && (
              <button
                className="absolute top-1 right-1 bg-white bg-opacity-75 text-xs px-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setHashFilter(m.hash);
                }}
              >
                dup {dupCount(m.hash)}
              </button>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-sm text-gray-500">No assets</div>
        )}
      </div>
    </div>
  );
}
