import type { ImageNode, AssetMeta } from '@/types/editor';
import { computeDrawRect } from './fit';

export interface ScaleInfo {
  displayCss: { w: number; h: number };
  displayDevice: { w: number; h: number };
  natural: { w: number; h: number };
  scaleX: number;
  scaleY: number;
  scaleMax: number;
}

export function getScaleInfo(
  node: ImageNode,
  asset: AssetMeta,
  dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1,
): ScaleInfo {
  const natural = node.props.crop
    ? { w: node.props.crop.w, h: node.props.crop.h }
    : { w: asset.w, h: asset.h };
  const frame = {
    w: node.props.w || asset.w,
    h: node.props.h || asset.h,
  };
  const fit = node.props.fit || 'contain';
  const pos = node.props.position || { x: 0.5, y: 0.5 };
  const draw = computeDrawRect(frame, natural, fit, pos, node.props.crop);
  const displayCss = { w: draw.w, h: draw.h };
  const displayDevice = { w: draw.w * dpr, h: draw.h * dpr };
  const scaleX = displayDevice.w / natural.w;
  const scaleY = displayDevice.h / natural.h;
  return {
    displayCss,
    displayDevice,
    natural,
    scaleX,
    scaleY,
    scaleMax: Math.max(scaleX, scaleY),
  };
}

export function isUpscaled(si: ScaleInfo, threshold = 1.3): boolean {
  return si.scaleMax > threshold;
}

