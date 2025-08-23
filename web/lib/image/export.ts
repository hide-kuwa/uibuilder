import type { ImageNode } from '@/types/editor';
import { cssFilter } from './filters';

export function exportImageStyle(node: ImageNode) {
  const style: Record<string, any> = {};
  if (node.props.adjustments) {
    const f = cssFilter(node.props.adjustments);
    if (f) style.filter = f;
    if (node.props.adjustments.opacity !== undefined)
      style.opacity = node.props.adjustments.opacity;
  }
  if (node.props.blend) style.mixBlendMode = node.props.blend;
  return style;
}
