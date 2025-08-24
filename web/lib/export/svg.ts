import type { TextNode } from '@/types/editor';
import { renderTextToSVG } from './text';

export async function exportSVG(node: TextNode, opts: { dpr?: number } = {}): Promise<string> {
  return renderTextToSVG(node, opts);
}
