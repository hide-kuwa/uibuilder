'use client';
import { useEffect, useState, type CSSProperties } from 'react';
import { loadImage } from '@/lib/assets';
import { normalizeAdjustments, toCssFilter } from '@/lib/image/filters';
import { getScaleInfo, isUpscaled } from '@/lib/image/metrics';
import type { ImageNode, AssetMeta } from '@/types/editor';
import { useEditorStore } from '@/store/editorStore';

export default function ImageView({ node, meta }: { node: ImageNode; meta: AssetMeta }) {
  const startCrop = useEditorStore((s) => s.startCrop);
  const showBadges = useEditorStore((s) => s.prefs?.showImageBadges !== false);
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
  const adj = normalizeAdjustments(node.props.adjustments);
  const si = getScaleInfo(node, meta);
  const badge =
    showBadges && isUpscaled(si) ? (
      <div className="image-badge">
        Upscaled ×{si.scaleMax.toFixed(2)}
      </div>
    ) : null;
  const styleCommon: CSSProperties = {
    filter: toCssFilter(node.props.adjustments),
    mixBlendMode: node.props.blend || 'normal',
    opacity: adj.opacity,
    willChange: 'filter',
  };
  if (crop) {
    const scaleX = (node.props.w || meta.w) / crop.w;
    const scaleY = (node.props.h || meta.h) / crop.h;
    return (
      <div
        className="w-full h-full overflow-hidden relative"
        onDoubleClick={() => startCrop(node.id)}
      >
        <img
          src={url}
          style={{
            width: meta.w * scaleX,
            height: meta.h * scaleY,
            transform: `translate(${-crop.x * scaleX}px, ${-crop.y * scaleY}px)`,
            ...styleCommon,
          }}
        />
        {badge}
      </div>
    );
  }
  return (
    <div className="w-full h-full relative" onDoubleClick={() => startCrop(node.id)}>
      <img
        src={url}
        style={{
          width: '100%',
          height: '100%',
          objectFit: fit,
          objectPosition: `${pos.x * 100}% ${pos.y * 100}%`,
          ...styleCommon,
        }}
      />
      {badge}
    </div>
  );
}
