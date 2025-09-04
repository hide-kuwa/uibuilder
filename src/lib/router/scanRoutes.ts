import fs from 'fs';
import path from 'path';

export interface NestedMenuItem {
  id: string;            // unique id (path)
  label: string;         // display label
  href: string;          // route href
  children?: NestedMenuItem[];
  hidden?: boolean;
  disabled?: boolean;
}

// helper to humanize segment name
function labelFromSegment(seg: string): string {
  if (!seg) return 'Home';
  const s = seg.replace(/^[\[\]\(\)]+|[\[\]\(\)]+$/g, '');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function readTitle(file: string, fallback: string): string {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const first = content.split(/\r?\n/)[0];
    const m = first.match(/\/\/\s*title:\s*(.+)/i);
    if (m) return m[1].trim();
  } catch {
    // ignore
  }
  return fallback;
}

function walk(dir: string, segs: string[]): NestedMenuItem | null {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const children: NestedMenuItem[] = [];

  for (const e of entries) {
    if (e.isDirectory()) {
      const child = walk(path.join(dir, e.name), [...segs, e.name]);
      if (child) children.push(child);
    }
  }

  const page = entries.find(e => e.isFile() && /^page\.(tsx|ts|jsx|js)$/.test(e.name));
  if (!page && children.length === 0) return null;

  const href = '/' + segs.join('/');
  const label = page ? readTitle(path.join(dir, page.name), labelFromSegment(segs[segs.length - 1] ?? '')) : labelFromSegment(segs[segs.length - 1] ?? '');

  return { id: href || '/', href: href || '/', label, children: children.length ? children : undefined };
}

export function scanRoutes(root = path.join(process.cwd(), 'src/app')): NestedMenuItem[] {
  if (!fs.existsSync(root)) return [];
  const rootNode = walk(root, []);
  return rootNode?.children ?? [];
}

export default scanRoutes;
