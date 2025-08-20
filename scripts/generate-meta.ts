import path from 'path'
import { promises as fs } from 'fs'
import { withDefaultConfig } from 'react-docgen-typescript'

async function collect(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files: string[] = []
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) files.push(...await collect(full))
    else if (e.isFile() && full.endsWith('.tsx')) files.push(full)
  }
  return files
}

async function main() {
  const root = path.resolve('src/components/custom')
  const out = path.resolve('component-meta.json')
  let files: string[] = []
  try {
    files = await collect(root)
  } catch {}
  const parser = withDefaultConfig({ savePropValueAsString: true })
  const components: any[] = []
  for (const file of files) {
    try {
      const docs = parser.parse(file)
      for (const doc of docs) {
        const props = Object.keys(doc.props || {}).sort().map(name => {
          const prop = doc.props[name]
          const meta: any = { name, type: prop.type.name, required: prop.required, description: prop.description || '' }
          if (prop.defaultValue) meta.defaultValue = prop.defaultValue.value
          return meta
        })
        components.push({ displayName: doc.displayName, props })
      }
    } catch {}
  }
  components.sort((a, b) => a.displayName.localeCompare(b.displayName))
  await fs.writeFile(out, JSON.stringify(components, null, 2))
}

main()
