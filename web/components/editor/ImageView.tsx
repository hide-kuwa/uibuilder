'use client';
import { useEffect, useState, type CSSProperties } from 'react';
import { loadImage } from '@/lib/assets';
import { cssFilter } from '@/lib/image/filters';
import type { ImageNode, AssetMeta } from '@/types/editor';
import { useEditorStore } from '@/store/editorStore';

export default function ImageView({ node, meta }: { node: ImageNode; meta: AssetMeta }) {
  const startCrop = useEditorStore((s) => s.startCrop);
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
  const crop = node.props.crop;
  const styleCommon: CSSProperties = {
    filter: cssFilter(node.props.adjustments),
    mixBlendMode: node.props.blend,
    opacity: node.props.adjustments?.opacity,
  };
  if (crop) {
    const scaleX = (node.props.w || meta.w) / crop.w;
    const scaleY = (node.props.h || meta.h) / crop.h;
    return (
      <div className="w-full h-full overflow-hidden" onDoubleClick={() => startCrop(node.id)}>
        <img
          src={url}
          style={{
            width: meta.w * scaleX,
            height: meta.h * scaleY,
            transform: `translate(${-crop.x * scaleX}px, ${-crop.y * scaleY}px)`,
            ...styleCommon,
          }}
        />
      </div>
    );
  }
  return (
    <img
      src={url}
      style={{
        width: '100%',
        height: '100%',
        objectFit: fit,
        objectPosition: `${pos.x * 100}% ${pos.y * 100}%`,
        ...styleCommon,
      }}
      onDoubleClick={() => startCrop(node.id)}
    />
  );
}
