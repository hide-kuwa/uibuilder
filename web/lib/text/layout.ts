import type { TextNode } from '@/types/editor';
import { measure } from './measure';

export function layoutText(node: TextNode) {
  const maxWidth = node.resizeMode === 'AUTO_HEIGHT' ? node.props?.w : undefined;
  const m = measure(node.text, node.style, { maxWidth });
  let w = node.props?.w || m.width;
  let h = node.props?.h || m.lineHeight;
  if (node.resizeMode === 'AUTO_WIDTH') {
    w = m.width;
    h = m.lineHeight;
  } else if (node.resizeMode === 'AUTO_HEIGHT') {
    h = m.height;
    w = node.props?.w ?? m.width;
  } else if (node.resizeMode === 'FIXED') {
    w = node.props?.w ?? m.width;
    h = node.props?.h ?? m.height;
  } else {
    w = m.width;
    h = m.height;
  }
  return { w, h };
}
