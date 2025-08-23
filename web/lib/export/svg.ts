import { toSvg } from 'html-to-image';
import type { ExportScope, ExportOptions } from './index';

function getTargetElement(_scope: ExportScope): HTMLElement {
  return document.body as HTMLElement;
}

export async function exportSVG(scope: ExportScope, opts: ExportOptions = {}): Promise<string> {
  const el = getTargetElement(scope);
  const svgText = await toSvg(el, {
    cacheBust: true,
    backgroundColor:
      opts.background && opts.background !== 'transparent'
        ? opts.background.color
        : undefined,
  });
  return svgText;
}
