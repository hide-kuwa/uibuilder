import type { EditorState } from '@/types/editor';
import type { ExportOptions } from '@/types/export';
import { serialize } from '../serialize';

export function exportReact(state: EditorState, opts: ExportOptions) {
  const data = JSON.stringify(serialize(state));
  const code = `export default function Design(){return <pre>{JSON.stringify(${data}, null, 2)}</pre>;}`;
  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${opts.fileName || 'uibuilder-export'}.tsx`;
  a.click();
  URL.revokeObjectURL(url);
}
