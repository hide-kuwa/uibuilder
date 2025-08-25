export { extractTokensFromTree, tokensToJSON, tokensToTS } from './tokens'
export type { Tokens } from './tokens'

import { buildAssetMap, extractAssetsFromTree, type AssetMap } from '@/lib/assets'

/** ツリーからアセットマップ(JSON文字列)を生成して返す */
export async function buildAssetMapJSON(tree: any[]): Promise<{ json: string; map: AssetMap }> {
  const assets = extractAssetsFromTree(tree)
  const map = await buildAssetMap(assets)
  return { json: JSON.stringify(map, null, 2), map }
}

export interface ExportScope {
  mode: 'selection' | 'frame' | 'page'
  id?: string
}

export interface ExportOptions {
  scale?: number // 1..4, default 1
  background?: 'transparent' | { color: string }
}

export type ExportFormat = 'png' | 'svg' | 'html' | 'react'

export interface ExportPreset extends ExportOptions {
  format: ExportFormat
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

// ===== Diff Export (MVP) =====
export function exportChanged(tree: any[], ids: string[]) {
  const idSet = new Set(ids)
  const nodes: any[] = []
  traverse(tree, (n: any) => { if (idSet.has(n?.id)) nodes.push(n) })
  const meta = { exportedAt: Date.now(), ids: Array.from(idSet) }
  const json = JSON.stringify({ meta, nodes }, null, 2)
  return { json, meta }
}

function traverse(nodes: any[], fn: (n: any) => void) {
  for (const n of nodes || []) {
    fn(n)
    if (n?.children) traverse(n.children, fn)
  }
}
