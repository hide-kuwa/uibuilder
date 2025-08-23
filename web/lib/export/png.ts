import { toPng } from 'html-to-image';
import type { ExportScope, ExportOptions } from './index';

function getTargetElement(_scope: ExportScope): HTMLElement {
  // Placeholder: export entire document body
  return document.body as HTMLElement;
}

export async function exportPNG(scope: ExportScope, opts: ExportOptions = {}): Promise<Blob> {
  const el = getTargetElement(scope);
  const dataUrl = await toPng(el, {
    cacheBust: true,
    pixelRatio: opts.scale ?? 1,
    backgroundColor:
      opts.background && opts.background !== 'transparent'
        ? opts.background.color
        : undefined,
  });
  const res = await fetch(dataUrl);
  return await res.blob();
}
