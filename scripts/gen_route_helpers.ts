import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.join(__dirname, '..');
const appDir = path.join(projectRoot, 'web', 'app');
const outFile = path.join(projectRoot, 'web', 'lib', 'paths.ts');

type Param = { name: string; catchAll: boolean };

function walk(dir: string, segments: string[], routes: string[]) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const hasPage = entries.some(e => e.isFile() && /^page\.(t|j)sx?$/.test(e.name));
  if (hasPage) {
    if (segments[0] !== 'api') {
      const params: Param[] = [];
      const statics: string[] = [];
      let dynamic = false;
      for (const seg of segments) {
        if (/^\[\.\.\..*\]$/.test(seg)) {
          dynamic = true;
          params.push({ name: seg.slice(4, -1), catchAll: true });
        } else if (/^\[.*\]$/.test(seg)) {
          dynamic = true;
          params.push({ name: seg.slice(1, -1), catchAll: false });
        } else {
          statics.push(seg);
        }
      }
      if (dynamic) {
        let fnName = statics.join('_') || 'route';
        if (params.some(p => p.catchAll)) fnName += '_catchAll';
        const paramDecl = params
          .map(p => `${p.name}: ${p.catchAll ? 'string[]' : 'string'}`)
          .join(', ');
        const parts: string[] = [];
        let i = 0;
        for (const seg of segments) {
          if (/^\[\.\.\..*\]$/.test(seg)) {
            const p = params[i++];
            parts.push('${' + p.name + '.map(encodeURIComponent).join("/")}' );
          } else if (/^\[.*\]$/.test(seg)) {
            const p = params[i++];
            parts.push('${encodeURIComponent(' + p.name + ')}');
          } else {
            parts.push(seg);
          }
        }
        const template = '`/' + parts.join('/') + '`';
        routes.push(`export const ${fnName} = (${paramDecl}) => ${template};`);
      }
    }
  }
  for (const e of entries.filter(e => e.isDirectory())) {
    walk(path.join(dir, e.name), [...segments, e.name], routes);
  }
}

function main() {
  const routes: string[] = [];
  walk(appDir, [], routes);
  routes.sort();
  const content = routes.join('\n') + '\n';
  if (!fs.existsSync(path.dirname(outFile))) {
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
  }
  if (!fs.existsSync(outFile) || fs.readFileSync(outFile, 'utf8') !== content) {
    fs.writeFileSync(outFile, content);
  }
}

main();

