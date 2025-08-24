import type { TextNode } from '@/types/editor';
import { renderTextToHTML } from './text';

export async function exportHTML(node: TextNode, opts: { dpr?: number } = {}): Promise<{ html: string }> {
  const html = renderTextToHTML(node, opts);
  return { html };
}
