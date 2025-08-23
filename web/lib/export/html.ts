import { serialize } from '../serialize';
import { useEditorStore } from '@/store/editorStore';
import type { ExportScope, ExportOptions } from './index';

export async function exportHTML(_scope: ExportScope, _opts: ExportOptions = {}): Promise<{ html: string }> {
  const state = useEditorStore.getState();
  const data = JSON.stringify(serialize(state));
  const html = `<!DOCTYPE html><html><head></head><body><pre>${data}</pre></body></html>`;
  return { html };
}
