import fg from 'fast-glob';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const APP_DIR = join(process.cwd(), 'app');

// 除外ルール（適宜調整）
const IGNORE = [
  '**/api/**',
  '**/_*/*',
  // '**/(*)/**', // ルートグループ
  '**/node_modules/**',
  '**/.*',
];

function humanize(seg: string) {
  return seg.replace(/^\[(.+)\]$/, '$1').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

async function main() {
  const files = await fg(['**/page.tsx', '**/page.ts'], { cwd: APP_DIR, ignore: IGNORE });
  const routes = files.map(f => {
    const dir = f.replace(/\/page\.tsx?$/, '');
    const href = '/' + dir.replace(/\\/g, '/');
    const segments = href.split('/').filter(Boolean);
    const label = humanize(segments[segments.length - 1] || 'Home');
    return { id: href || '/', href: href || '/', label, segments };
  });

  const out = `// GENERATED FILE. DO NOT EDIT.\nexport type GeneratedItem = { id: string; href: string; label: string; segments: string[] };\nexport const GENERATED_MENU: GeneratedItem[] = ${JSON.stringify(routes, null, 2)};\n`;
  const outDir = join(process.cwd(), '.generated');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'menu.gen.ts'), out, 'utf8');
  console.log('Generated', routes.length, 'routes.');
}
main().catch(e => { console.error(e); process.exit(1); });
