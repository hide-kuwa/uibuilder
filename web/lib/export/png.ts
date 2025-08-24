import type { TextNode } from '@/types/editor';
import { renderTextToCanvas } from './text';

export async function exportPNG(node: TextNode, opts: { dpr?: number } = {}): Promise<Blob> {
  const canvas = renderTextToCanvas(node, { dpr: opts.dpr });
  return await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/png');
  });
}
