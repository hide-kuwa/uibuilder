import { serialize } from '../serialize';
import { useEditorStore } from '@/store/editorStore';
import type { ExportScope, ExportOptions } from './index';

export async function exportReact(_scope: ExportScope, _opts: ExportOptions = {}): Promise<{ jsx: string }> {
  const state = useEditorStore.getState();
  const data = JSON.stringify(serialize(state));
  const jsx = `export default function Design(){return <pre>{JSON.stringify(${data}, null, 2)}</pre>;}`;
  return { jsx };
}
