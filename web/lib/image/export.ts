import type { ImageNode } from '@/types/editor';
import { normalizeAdjustments, toCssFilter } from './filters';

export function exportImageStyle(node: ImageNode) {
  const adj = normalizeAdjustments(node.props.adjustments);
  const style: Record<string, any> = {
    filter: toCssFilter(adj),
    opacity: adj.opacity,
    mixBlendMode: node.props.blend || 'normal',
  };
  return style;
}
