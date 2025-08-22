import { toSvg } from 'html-to-image';
import type { ExportOptions } from '@/types/export';

export async function exportSVG(el: HTMLElement, opts: ExportOptions) {
  const dataUrl = await toSvg(el, {
    cacheBust: true,
    backgroundColor: opts.transparent ? 'transparent' : undefined,
  });
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${opts.fileName || 'uibuilder-export'}.svg`;
  a.click();
}
