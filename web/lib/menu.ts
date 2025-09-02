import type { MenuNode, OverlayNode, SidebarPreset } from '@/types/sidebar';
import { GENERATED_MENU } from '../.generated/menu.gen';

export function buildAutoTree(): MenuNode[] {
  const root: MenuNode = { id: '/', href: '/', label: 'Home', children: [] };
  const byPath = new Map<string, MenuNode>([['/', root]]);

  for (const item of GENERATED_MENU) {
    const parts = item.segments;
    let parent = root;
    let path = '';
    for (let i = 0; i < parts.length; i++) {
      path += '/' + parts[i];
      if (!byPath.has(path)) {
        const node: MenuNode = { id: path, href: path, label: i === parts.length - 1 ? item.label : parts[i], children: [] };
        byPath.set(path, node);
        parent.children!.push(node);
      }
      parent = byPath.get(path)!;
    }
  }
  return root.children ?? [];
}

function applyIncludeExclude(nodes: MenuNode[], include?: string[], exclude?: string[]) {
  const inc = include && include.length ? new Set(include) : null;
  const exc = new Set(exclude ?? []);
  const walk = (arr: MenuNode[]): MenuNode[] =>
    arr
      .filter(n => (!inc || inc.has(n.id) || (n.children && n.children.some(c => inc!.has(c.id)))) && !exc.has(n.id))
      .map(n => ({ ...n, children: n.children ? walk(n.children) : undefined }));
  return walk(nodes);
}

function buildIndex(nodes: MenuNode[], idx = new Map<string, MenuNode>()): Map<string, MenuNode> {
  for (const n of nodes) { idx.set(n.id, n); if (n.children) buildIndex(n.children, idx); }
  return idx;
}

function materializeOverlay(overlay: OverlayNode[], index: Map<string, MenuNode>): MenuNode[] {
  const mat = (o: OverlayNode): MenuNode | null => {
    const base = index.get(o.ref);
    if (!base) return null;
    return {
      id: base.id,
      href: base.href,
      label: o.label ?? base.label,
      hidden: o.hidden ?? base.hidden,
      children: o.children ? o.children.map(mat).filter(Boolean) as MenuNode[] : undefined,
    };
  };
  return overlay.map(mat).filter(Boolean) as MenuNode[];
}

export function mergeMenu(preset: SidebarPreset): MenuNode[] {
  const auto = buildAutoTree();
  if (preset.mode === 'manual') {
    const idx = buildIndex(auto);
    return preset.overlay ? materializeOverlay(preset.overlay, idx) : [];
  }
  const filtered = applyIncludeExclude(auto, preset.include, preset.exclude);
  if (!preset.overlay?.length) return filtered;

  const idx = buildIndex(filtered);
  const over = materializeOverlay(preset.overlay, idx);
  const used = new Set<string>();
  (function mark(arr: MenuNode[]) { arr.forEach(n => { used.add(n.id); if (n.children) mark(n.children); }); })(over);
  const rest = filtered.filter(n => !used.has(n.id));
  return [...over, ...rest];
}
