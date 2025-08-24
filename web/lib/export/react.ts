import type { TextNode } from '@/types/editor';
import { renderTextToReact } from './text';

export async function exportReact(node: TextNode, opts: { dpr?: number } = {}): Promise<{ jsx: string }> {
  const jsx = renderTextToReact(node, opts);
  return { jsx };
}
