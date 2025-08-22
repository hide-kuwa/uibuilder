import type { ComponentNode } from '@/types/editor';

export function sizeStyle(
  node: ComponentNode,
  parentAxis: 'horizontal' | 'vertical' | undefined
) {
  const style: any = {};
  const p = node.props || {};
  switch (p.widthMode) {
    case 'FILL':
      if (parentAxis === 'horizontal') style.flex = '1 1 auto';
      else style.width = '100%';
      break;
    case 'HUG':
      style.width = 'fit-content';
      break;
    default:
      if (p.w !== undefined) style.width = p.w;
  }
  switch (p.heightMode) {
    case 'FILL':
      if (parentAxis === 'vertical') style.flex = '1 1 auto';
      else style.height = '100%';
      break;
    case 'HUG':
      style.height = 'fit-content';
      break;
    default:
      if (p.h !== undefined) style.height = p.h;
  }
  return style;
}
