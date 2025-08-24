export interface ExportScope {
  mode: 'selection' | 'frame' | 'page';
  id?: string;
}

export interface ExportOptions {
  scale?: number; // 1..4, default 1
  background?: 'transparent' | { color: string };
}

export type ExportFormat = 'png' | 'svg' | 'html' | 'react';

export interface ExportPreset extends ExportOptions {
  format: ExportFormat;
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

export async function exportMany(
  scopes: ExportScope[],
  opts: ExportPreset,
) {
  const promises = scopes.map((s) => {
    switch (opts.format) {
      case 'png':
        return exportPNG(s, opts);
      case 'svg':
        return exportSVG(s, opts);
      case 'html':
        return exportHTML(s, opts);
      case 'react':
        return exportReact(s, opts);
    }
  });
  return Promise.all(promises);
}

export const PRESETS: Record<string, ExportPreset> = {
  png2x: { format: 'png', scale: 2 },
  svg: { format: 'svg' },
  html: { format: 'html' },
  react: { format: 'react' },
};
