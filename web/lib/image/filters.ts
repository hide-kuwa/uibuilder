import type { ImageAdjustments } from '@/types/editor';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function normalize(adj: ImageAdjustments = {}): Required<ImageAdjustments> {
  return {
    brightness: clamp(adj.brightness ?? 1, 0, 2),
    contrast: clamp(adj.contrast ?? 1, 0, 2),
    saturation: clamp(adj.saturation ?? 1, 0, 2),
    hue: clamp(adj.hue ?? 0, -180, 180),
    blur: clamp(adj.blur ?? 0, 0, 100),
    opacity: clamp(adj.opacity ?? 1, 0, 1),
  };
}

export function cssFilter(adj?: ImageAdjustments): string {
  if (!adj) return '';
  const a = normalize(adj);
  const parts = [
    `brightness(${a.brightness})`,
    `contrast(${a.contrast})`,
    `saturate(${a.saturation})`,
    `hue-rotate(${a.hue}deg)`,
  ];
  if (a.blur > 0) parts.push(`blur(${a.blur}px)`);
  return parts.join(' ');
}
