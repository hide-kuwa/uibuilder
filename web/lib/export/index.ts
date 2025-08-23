export interface ExportScope {
  mode: 'selection' | 'frame' | 'page';
  id?: string;
}

export interface ExportOptions {
  scale?: number; // 1..4, default 1
  background?: 'transparent' | { color: string };
}

export async function exportPNG(scope: ExportScope, opts?: ExportOptions) {
  const mod = await import('./png');
  return mod.exportPNG(scope, opts);
}

export async function exportSVG(scope: ExportScope, opts?: ExportOptions) {
  const mod = await import('./svg');
  return mod.exportSVG(scope, opts);
}

export async function exportHTML(scope: ExportScope, opts?: ExportOptions) {
  const mod = await import('./html');
  return mod.exportHTML(scope, opts);
}

export async function exportReact(scope: ExportScope, opts?: ExportOptions) {
  const mod = await import('./react');
  return mod.exportReact(scope, opts);
}
