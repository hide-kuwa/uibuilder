import path from 'path';
import { promises as fs } from 'fs';
import { withDefaultConfig } from 'react-docgen-typescript';

interface PropMeta {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description: string;
}

interface ComponentMeta {
  displayName: string;
  props: PropMeta[];
}

function parseArgs() {
  const args = process.argv.slice(2);
  let root: string | undefined;
  let out: string | undefined;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--root') {
      root = args[++i];
    } else if (arg === '--out') {
      out = args[++i];
    } else {
      console.error(`Unknown argument: ${arg}`);
      console.error('Usage: ts-node scripts/gen-component-meta.ts --root <root> --out <out>');
      process.exit(1);
    }
  }
  if (!root || !out) {
    console.error('Usage: ts-node scripts/gen-component-meta.ts --root <root> --out <out>');
    process.exit(1);
  }
  return { root, out };
}

async function collectFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(fullPath));
    } else if (
      entry.isFile() &&
      fullPath.endsWith('.tsx') &&
      !fullPath.endsWith('.stories.tsx') &&
      !fullPath.endsWith('.test.tsx')
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  const { root, out } = parseArgs();
  const rootDir = path.resolve(root);
  const outFile = path.resolve(out);

  const files = (await collectFiles(rootDir)).sort();

  const parser = withDefaultConfig({ savePropValueAsString: true });
  const components: ComponentMeta[] = [];
  let hadError = false;

  for (const file of files) {
    try {
      const docs = parser.parse(file);
      for (const doc of docs) {
        const props: PropMeta[] = Object.keys(doc.props || {})
          .sort()
          .map((propName) => {
            const prop = doc.props[propName];
            const meta: PropMeta = {
              name: propName,
              type: prop.type.name,
              required: prop.required,
              description: prop.description || ''
            };
            if (prop.defaultValue) {
              meta.defaultValue = prop.defaultValue.value;
            }
            return meta;
          });
        components.push({ displayName: doc.displayName, props });
      }
    } catch (err: any) {
      hadError = true;
      console.error(`Error parsing ${path.relative(process.cwd(), file)}: ${err.message}`);
    }
  }

  if (hadError) {
    process.exit(1);
  }

  components.sort((a, b) => a.displayName.localeCompare(b.displayName));

  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, JSON.stringify(components, null, 2), 'utf8');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
