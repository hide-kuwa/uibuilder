import { Constraints } from '@/types/editor';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function applyConstraints(
  parentBefore: Rect,
  parentAfter: Rect,
  childBefore: Rect,
  constraints: Constraints
): Rect {
  const dw = parentAfter.w - parentBefore.w;
  const dh = parentAfter.h - parentBefore.h;
  const result: Rect = { ...childBefore };

  switch (constraints.horizontal) {
    case 'LEFT':
      break;
    case 'RIGHT':
      result.x += dw;
      break;
    case 'LEFT_RIGHT':
      result.w += dw;
      break;
    case 'CENTER':
      result.x += dw / 2;
      break;
    case 'SCALE':
      result.x = (childBefore.x / parentBefore.w) * parentAfter.w;
      result.w = (childBefore.w / parentBefore.w) * parentAfter.w;
      break;
  }

  switch (constraints.vertical) {
    case 'TOP':
      break;
    case 'BOTTOM':
      result.y += dh;
      break;
    case 'TOP_BOTTOM':
      result.h += dh;
      break;
    case 'CENTER':
      result.y += dh / 2;
      break;
    case 'SCALE':
      result.y = (childBefore.y / parentBefore.h) * parentAfter.h;
      result.h = (childBefore.h / parentBefore.h) * parentAfter.h;
      break;
  }

  return result;
}
