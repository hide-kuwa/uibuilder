import { Project } from 'ts-morph'
import { withDefaultConfig } from 'react-docgen-typescript'
import { writeFileSync } from 'fs'
import { join } from 'path'

const project = new Project({ tsConfigFilePath: join(process.cwd(), 'web', 'tsconfig.json'), skipAddingFilesFromTsConfig: true })
project.addSourceFilesAtPaths('web/components/custom/**/*.{ts,tsx}')

const parser = withDefaultConfig({ savePropValueAsString: true })
const out:any[] = []

for (const sf of project.getSourceFiles()) {
  try {
    const docs = parser.parse(sf.getFilePath())
    docs.forEach(doc => {
      const props = Object.entries(doc.props || {}).map(([name, p]: any) => ({
        name,
        type: p.type?.name || '',
        required: !!p.required,
        default: p.defaultValue?.value,
        description: p.description || ''
      }))
      out.push({ displayName: doc.displayName, props })
    })
  } catch {}
}

writeFileSync(join(process.cwd(), 'web', 'public', 'component-meta.json'), JSON.stringify(out, null, 2))
console.log('wrote component-meta.json')
