import type { EditorState } from '@/types/editor';
import type { ExportOptions } from '@/types/export';
import { serialize } from '../serialize';

export function exportHTML(state: EditorState, opts: ExportOptions) {
  const data = JSON.stringify(serialize(state));
  const tailwind = opts.includeTailwindCdn
    ? '<script src="https://cdn.tailwindcss.com"></script>'
    : '';
  const html = `<!DOCTYPE html><html><head>${tailwind}</head><body><div id="root"></div><script>const data=${data};document.getElementById('root').textContent = '';</script></body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${opts.fileName || 'uibuilder-export'}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
