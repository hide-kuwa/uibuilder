import type { ComponentNode } from '@/types/editor';

export interface Positioned {
  id: string;
  x: number;
  y: number;
}

/**
 * Computes basic auto layout positioning for a frame's children.
 * Supports gap, padding, wrap and justifyContent='space-between'.
 * This is a simplified layout engine used for Canvas preview.
 */
export function computeAutoLayout(frame: ComponentNode): Record<string, { x: number; y: number }> {
  const res: Record<string, { x: number; y: number }> = {};
  const p = frame.props || {};
  if (!frame.children || frame.children.length === 0) return res;
  if (p.layout !== 'auto') return res;

  const isHorizontal = p.axis === 'horizontal';
  const gap = p.gap ?? 0;
  const pad = normalizePadding(p.padding);
  const wrap = p.wrap;
  const maxPerLine = p.maxPerLine ?? Infinity;

  const availableMain = (isHorizontal ? p.w ?? 0 : p.h ?? 0) - (isHorizontal ? pad.left + pad.right : pad.top + pad.bottom);
  let lines: ComponentNode[][] = [];
  let line: ComponentNode[] = [];
  let count = 0;
  for (const child of frame.children) {
    line.push(child);
    count++;
    if (wrap && count >= maxPerLine) {
      lines.push(line);
      line = [];
      count = 0;
    }
  }
  if (line.length) lines.push(line);

  let cross = pad.top;
  for (const items of lines) {
    let main = pad.left;
    const mainSize = items.reduce((sum, c) => sum + (isHorizontal ? c.props?.w || 0 : c.props?.h || 0), 0);
    let spacing = gap;
    if (p.justifyContent === 'space-between' && items.length > 1) {
      spacing = (availableMain - mainSize) / (items.length - 1);
    }
    for (const c of items) {
      res[c.id] = { x: isHorizontal ? main : pad.left, y: isHorizontal ? cross : main };
      main += (isHorizontal ? c.props?.w || 0 : c.props?.h || 0) + spacing;
    }
    cross += (isHorizontal
      ? Math.max(...items.map((c) => c.props?.h || 0))
      : Math.max(...items.map((c) => c.props?.w || 0))) + gap;
  }
  return res;
}

function normalizePadding(pad: any): { top: number; right: number; bottom: number; left: number } {
  if (pad == null) return { top: 0, right: 0, bottom: 0, left: 0 };
  if (typeof pad === 'number') return { top: pad, right: pad, bottom: pad, left: pad };
  return {
    top: pad.top || 0,
    right: pad.right || 0,
    bottom: pad.bottom || 0,
    left: pad.left || 0,
  };
}
