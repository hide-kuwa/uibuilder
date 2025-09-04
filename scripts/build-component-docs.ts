import { Project } from 'ts-morph';
import { withDefaultConfig } from 'react-docgen-typescript';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';

import { getRegisteredComponents } from '../src/features/uibuilder/editor/componentRegistry';
import '../src/features/uibuilder/editor/registerComponents';

const root = process.cwd();

const project = new Project({
  tsConfigFilePath: path.join(root, 'tsconfig.json'),
  skipAddingFilesFromTsConfig: true,
});

const componentDirs = [
  path.join(root, 'src', 'components'),
  path.join(root, 'components'),
].filter(existsSync);

componentDirs.forEach((dir) => {
  project.addSourceFilesAtPaths(`${dir}/**/*.{ts,tsx}`);
});

const parser = withDefaultConfig({ savePropValueAsString: true });

const registered = new Set(
  getRegisteredComponents().map((c) => c.component.name)
);

interface PropDoc {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description: string;
}

interface ComponentDoc {
  name: string;
  description: string;
  props: PropDoc[];
  available: boolean;
}

const docs: ComponentDoc[] = [];

for (const sf of project.getSourceFiles()) {
  try {
    const parsed = parser.parse(sf.getFilePath());
    parsed.forEach((doc) => {
      const props: PropDoc[] = Object.entries(doc.props || {}).map(
        ([name, p]: any) => ({
          name,
          type: p.type?.name || '',
          required: !!p.required,
          default: p.defaultValue?.value,
          description: p.description || '',
        })
      );

      docs.push({
        name: doc.displayName,
        description: doc.description || '',
        props,
        available: registered.has(doc.displayName),
      });
    });
  } catch {
    // ignore parse errors
  }
}

const outDir = path.join(root, 'web', 'public', 'docs');
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, 'components.json'), JSON.stringify(docs, null, 2));

console.log('wrote', path.join(outDir, 'components.json'));

