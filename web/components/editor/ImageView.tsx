'use client';
import { useEffect, useState } from 'react';
import { loadImage } from '@/lib/assets';
import type { ImageNode, AssetMeta } from '@/types/editor';

export default function ImageView({ node, meta }: { node: ImageNode; meta: AssetMeta }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let currentUrl: string | null = null;
    loadImage(meta.id).then((blob) => {
      if (!blob) return;
      currentUrl = URL.createObjectURL(blob);
      setUrl(currentUrl);
    });
    return () => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [meta.id]);
  const fit = node.props.fit || 'contain';
  const pos = node.props.position || { x: 0.5, y: 0.5 };
  if (!url) return null;
  return (
    <img
      src={url}
      style={{
        width: '100%',
        height: '100%',
        objectFit: fit,
        objectPosition: `${pos.x * 100}% ${pos.y * 100}%`,
      }}
    />
  );
}
