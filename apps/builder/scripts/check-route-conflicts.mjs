// Minimal conflict scanner: pages/** vs app/**/page.* -> same route?
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const appDir = path.join(root, 'app');
const pagesDir = path.join(root, 'pages');

function walk(dir, filter) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) out.push(...walk(p, filter));
    else if (!filter || filter(p)) out.push(p);
  }
  return out;
}

function routeFromPages(p) {
  // pages/dev/figma.tsx -> /dev/figma
  // pages/dev/index.tsx -> /dev
  const rel = p.split(`${path.sep}pages${path.sep}`)[1];
  const noExt = rel.replace(/\.(tsx|ts|jsx|js|mdx)$/, '');
  const route = noExt.replace(/\\+/g, '/').replace(/\/index$/, '');
  return '/' + route.replace(/^\/+/, '');
}

function routeFromApp(p) {
  // app/dev/figma/page.tsx -> /dev/figma
  const rel = p.split(`${path.sep}app${path.sep}`)[1];
  const dir = path.dirname(rel);
  return '/' + dir.replace(/\\+/g, '/').replace(/^\/+/, '');
}

const pagesFiles = walk(pagesDir, (p) => /\.(tsx|ts|jsx|js|mdx)$/.test(p) && !/\/_app|\/_document|\/_error/.test(p));
const appFiles = walk(appDir, (p) => /\/page\.(tsx|ts|jsx|js|mdx)$/.test(p));

const pagesRoutes = new Map();
for (const p of pagesFiles) pagesRoutes.set(routeFromPages(p), p);

const conflicts = [];
for (const a of appFiles) {
  const r = routeFromApp(a);
  if (pagesRoutes.has(r)) conflicts.push({ route: r, pages: pagesRoutes.get(r), app: a });
}

if (conflicts.length) {
  console.error('Conflicting app and page files were found:');
  for (const c of conflicts) {
    console.error(`  "${c.pages}"  <->  "${c.app}"  route: ${c.route}`);
  }
  process.exit(1);
} else {
  console.log('No conflicts');
}