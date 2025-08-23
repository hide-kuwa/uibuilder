import type { ImageAdjustments } from '@/types/editor';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const DEFAULT_ADJ: Required<ImageAdjustments> = {
  brightness: 1,
  contrast: 1,
  saturation: 1,
  hue: 0,
  blur: 0,
  opacity: 1,
};

export function normalizeAdjustments(adj?: ImageAdjustments): Required<ImageAdjustments> {
  const a = adj || {};
  return {
    brightness: clamp(a.brightness ?? DEFAULT_ADJ.brightness, 0, 2),
    contrast: clamp(a.contrast ?? DEFAULT_ADJ.contrast, 0, 2),
    saturation: clamp(a.saturation ?? DEFAULT_ADJ.saturation, 0, 2),
    hue: clamp(a.hue ?? DEFAULT_ADJ.hue, -180, 180),
    blur: clamp(a.blur ?? DEFAULT_ADJ.blur, 0, 50),
    opacity: clamp(a.opacity ?? DEFAULT_ADJ.opacity, 0, 1),
  };
}

export function toCssFilter(adj?: ImageAdjustments): string {
  const a = normalizeAdjustments(adj);
  const parts = [
    `brightness(${a.brightness})`,
    `contrast(${a.contrast})`,
    `saturate(${a.saturation})`,
    `hue-rotate(${a.hue}deg)`,
  ];
  if (a.blur > 0) parts.push(`blur(${a.blur}px)`);
  return parts.join(' ');
}
