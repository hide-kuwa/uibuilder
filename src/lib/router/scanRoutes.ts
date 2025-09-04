import fs from 'fs';
import path from 'path';

export interface NestedMenuItem {
  id: string;            // unique identifier, typically the route path
  href: string;          // path used for navigation
  label: string;         // display title
  children?: NestedMenuItem[];
  hidden?: boolean;
  disabled?: boolean;
}

function readTitle(file: string, fallback: string) {
  try {
    const src = fs.readFileSync(file, 'utf8');
    const m = src.match(/^\s*\/\/\s*title:\s*(.+)$/m);
    return m ? m[1].trim() : fallback;
  } catch {
    return fallback;
  }
}

export function scanRoutes(appDir: string): NestedMenuItem[] {
  const walk = (dir: string, parentPath: string): NestedMenuItem[] => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const nodes: NestedMenuItem[] = [];
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      const seg = ent.name;
      const abs = path.join(dir, seg);
      const rel = path.posix.join(parentPath, seg);
      const page = ['page.tsx', 'page.ts', 'page.jsx', 'page.js']
        .map(f => path.join(abs, f))
        .find(fs.existsSync);
      const children = walk(abs, rel);
      if (page) {
        const label = readTitle(page, seg);
        nodes.push({ id: rel, href: rel, label, children: children.length ? children : undefined });
      } else if (children.length) {
        // folders without page.tsx are flattened
        nodes.push(...children);
      }
    }
    return nodes;
  };
  return walk(appDir, '');
}
