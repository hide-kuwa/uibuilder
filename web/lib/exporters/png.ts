import { toPng } from 'html-to-image';
import type { ExportOptions } from '@/types/export';

export async function exportPNG(el: HTMLElement, opts: ExportOptions) {
  const dataUrl = await toPng(el, {
    cacheBust: true,
    backgroundColor: opts.transparent ? 'transparent' : undefined,
    pixelRatio: opts.scale ?? 1,
  });
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${opts.fileName || 'uibuilder-export'}.png`;
  a.click();
}
