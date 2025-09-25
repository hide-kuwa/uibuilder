import fs from 'node:fs'
import path from 'node:path'
import { Project, SyntaxKind, Node, TypeFormatFlags, VariableDeclaration } from 'ts-morph'

type EntryKind = 'function' | 'const' | 'class' | 're-export'

type Entry = {
  file: string
  line: number
  kind: EntryKind
  name: string
  signature: string
}
type SymbolRecord = {
  name: string
  file: string
  line: number
  sourceText: string
}


type CategoryMeta = {
  title: string
  description: string
}

const PROJECT_ROOT = process.cwd()
const BUILDER_ROOT = path.resolve(PROJECT_ROOT, 'apps/builder')
const NOW_ISO = new Date().toISOString()

const BASELINE_PATH = path.resolve(PROJECT_ROOT, 'scripts/dev/baseline.json')
const baselineSymbols = loadBaseline(BASELINE_PATH)

const CATEGORY_ORDER = [
  'insert',
  'select',
  'export',
  'preview',
  'palette',
  'registry',
  'dnd',
  'factory',
  'serializeHook',
  'outbox',
] as const

type CategoryId = typeof CATEGORY_ORDER[number]

const CATEGORY_META: Record<CategoryId, CategoryMeta> = {
  insert: {
    title: 'Node Insertion & Mutation',
    description: 'Entry points that create, apply presets to, or otherwise mutate builder nodes.',
  },
  select: {
    title: 'Selection & Current State Stores',
    description: 'Selection stores and helpers tracking the active node, page, or project.',
  },
  export: {
    title: 'Export & Serialization Pipeline',
    description: 'Serialization, hashing, and export pipelines invoked when publishing or syncing.',
  },
  preview: {
    title: 'Preview & Action Engine Boot',
    description: 'Preview bridges and action engine bootstrapping hooks.',
  },
  palette: {
    title: 'Palette & Left Pane UI',
    description: 'Palette, library, and asset panel entry points for the left pane.',
  },
  registry: {
    title: 'Component Registry & Compat',
    description: 'Registry, compat, and handoff helpers resolving component definitions.',
  },
  dnd: {
    title: 'Drag & Drop Flows',
    description: 'Palette-to-canvas drag, drop guides, and related DnD orchestration.',
  },
  factory: {
    title: 'Node Factory Helpers',
    description: 'Factories creating nodes from definitions or wrapping repeat structures.',
  },
  serializeHook: {
    title: 'Serialize Hooks & Helpers',
    description: 'Serialize append hooks and deterministic stringifying helpers.',
  },
  outbox: {
    title: 'Outbox & Queueing',
    description: 'Outbox enqueue/flush flows, workers, and queue snapshots.',
  },
}


const EXCLUDE_PATHS = [/\/app\/api\//, /__tests__\//, /mocks?\//, /fixtures?\//]

const CATEGORIES: Record<CategoryId, RegExp[]> = {
  insert: [/insertNode|appendNode|addChild|applyPresetToNodes|apply.*Interaction/i],
  select: [/select(Node|Page|Project)|current(Node|Page|Project)|use.*Selection|stores?\/selection/i],
  export: [/serialize(Node|Tree)|generateExport|export.*(zip|page)|contentHash|hash|manifest/i],
  preview: [/ActionBoot|ActionPreview|bind.*ActionEngine|preview/i],
  palette: [/components\/leftpane\/Palette\.tsx$/i, /\b(render|mount)Palette\b/],
  registry: [/lib\/registry\/(compat|components)\.ts$/i, /\b(ComponentDef|register(get)?Component)\b/],
  dnd: [/paletteToCanvas|drag(Over|Start|End)|drop|DropGuide|DT_KEY|handleCanvasDrop/i],
  factory: [/createNode|nodeFactory|wrapRepeat|fromDef/i],
  serializeHook: [/serializeNode\.append|stableStringify|deterministic(Json|Stringify)/i],
  outbox: [/outbox|enqueue|queue|worker|flush|coalesce|snapshot/i],
}











const EXTRA_HINT_PATHS = [
  'apps/builder/components/leftpane',
  'apps/builder/lib/registry',
  'apps/builder/lib/dnd',
  'apps/builder/lib/nodes',
  'apps/builder/lib/export',
  'apps/builder/lib/outbox',
]

const symbolRecords: SymbolRecord[] = []
const symbolKeys = new Set<string>()

const categoryResults = new Map<CategoryId, Entry[]>(CATEGORY_ORDER.map((id) => [id, []]))
const seen = new Set<string>()

const project = new Project({
  tsConfigFilePath: path.resolve(BUILDER_ROOT, 'tsconfig.json'),
})

EXTRA_HINT_PATHS.forEach((hint) => {
  const pattern = path.resolve(PROJECT_ROOT, hint, '**/*.{ts,tsx,cts,mts}')
  project.addSourceFilesAtPaths(pattern)
})

const sourceFiles = project
  .getSourceFiles()
  .filter((file) => {
    const filePath = path.normalize(file.getFilePath()).toLowerCase()
    if (!filePath.startsWith(path.normalize(BUILDER_ROOT).toLowerCase())) return false
    if (file.isDeclarationFile()) return false
    if (!/\.(tsx?|mts|cts)$/.test(file.getBaseName())) return false
    if (filePath.includes(`${path.sep}node_modules${path.sep}`)) return false
    if (file.getBaseName().endsWith('.spec.ts') || file.getBaseName().endsWith('.spec.tsx')) return false
    return true
  })

const typeChecker = project.getTypeChecker()

for (const sourceFile of sourceFiles) {
  const relativePath = toRelativePath(sourceFile.getFilePath())
  processFunctionDeclarations(sourceFile, relativePath)
  processVariableDeclarations(sourceFile, relativePath)
  processClassDeclarations(sourceFile, relativePath)
  processExportDeclarations(sourceFile, relativePath)
}

const lines: string[] = []
lines.push('# Builder Scan Report')
lines.push('')
lines.push(`_Generated: ${NOW_ISO}_`)
lines.push('')
lines.push(`Scanned ${sourceFiles.length} files under \`apps/builder\`.`)
lines.push('')

for (const categoryId of CATEGORY_ORDER) {
  const meta = CATEGORY_META[categoryId]
  const entries = categoryResults.get(categoryId) ?? []
  entries.sort((a, b) => {
    const scoreDiff = scoreSymbol(b.name, b.file) - scoreSymbol(a.name, a.file)
    if (scoreDiff) return scoreDiff
    return a.file.localeCompare(b.file) || a.line - b.line || a.signature.localeCompare(b.signature)
  })
  lines.push(`## ${meta.title}`)
  lines.push('')
  lines.push(`> ${meta.description}`)
  lines.push('')
  if (!entries.length) {
    lines.push('- (no exported matches found)')
    lines.push('')
    continue
  }
  for (const entry of entries) {
    const location = `${entry.file}:${entry.line}`
    lines.push(emitEntry(categoryId, location, entry.name, entry.signature))
  }
  lines.push('')
}

const symbolList = [...symbolRecords]
const foundNames = new Set(symbolList.map((symbol) => symbol.name))
const missingBaseline = baselineSymbols.filter((name) => !foundNames.has(name))
if (missingBaseline.length) {
  console.error('Missing critical symbols:', missingBaseline.join(', '))
  process.exitCode = 1
}

if (symbolList.length) {
  const edges: Array<[string, string]> = []
  const seenEdges = new Set<string>()
  outer: for (const a of symbolList) {
    for (const b of symbolList) {
      if (a === b) continue
      if (a.sourceText.includes(b.name)) {
        const key = `${a.name}->${b.name}`
        if (seenEdges.has(key)) continue
        seenEdges.add(key)
        edges.push([a.name, b.name])
        if (edges.length >= 200) break outer
      }
    }
  }
  if (edges.length) {
    lines.push('## Dependency Sketch')
    lines.push('')
    lines.push('```mermaid')
    lines.push('graph TD')
    edges.forEach(([from, to]) => {
      lines.push(`  ${escapeMermaidId(from)} --> ${escapeMermaidId(to)}`)
    })
    lines.push('```')
    lines.push('')
  }
}

process.stdout.write(lines.join('\n'))

function processFunctionDeclarations(sourceFile: import('ts-morph').SourceFile, relativePath: string) {
  for (const declaration of sourceFile.getFunctions()) {
    const name = declaration.getName()
    if (!name) continue
    if (declaration.getFirstAncestorByKind(SyntaxKind.SourceFile) !== sourceFile) continue
    if (!declaration.hasExportKeyword() && !declaration.isDefaultExport()) continue
    const categories = classifySymbol(name, relativePath, declaration.getText())
    if (!categories.length) continue
    const signature = buildFunctionSignature(declaration)
    const lineNode = declaration.getNameNode() ?? declaration
    const lineNumber = lineNode.getStartLineNumber()
    trackSymbol({ name, file: relativePath, line: lineNumber, sourceText: declaration.getText() })
    addEntry(categories, {
      file: relativePath,
      line: lineNumber,
      kind: 'function',
      name,
      signature,
    })
  }
}

function processVariableDeclarations(sourceFile: import('ts-morph').SourceFile, relativePath: string) {
  for (const declaration of sourceFile.getVariableDeclarations()) {
    if (!isTopLevelVariable(declaration)) continue
    const nameNode = declaration.getNameNode()
    if (!Node.isIdentifier(nameNode)) continue
    const name = nameNode.getText()
    const categories = classifySymbol(name, relativePath, declaration.getText())
    if (!categories.length) continue
    const signature = buildVariableSignature(declaration)
    const lineNumber = nameNode.getStartLineNumber()
    trackSymbol({ name, file: relativePath, line: lineNumber, sourceText: declaration.getText() })
    addEntry(categories, {
      file: relativePath,
      line: lineNumber,
      kind: 'const',
      name,
      signature,
    })
  }
}

function processClassDeclarations(sourceFile: import('ts-morph').SourceFile, relativePath: string) {
  for (const declaration of sourceFile.getClasses()) {
    const name = declaration.getName()
    if (!name) continue
    if (declaration.getFirstAncestorByKind(SyntaxKind.SourceFile) !== sourceFile) continue
    if (!declaration.hasExportKeyword() && !declaration.isDefaultExport()) continue
    const categories = classifySymbol(name, relativePath, declaration.getText())
    if (!categories.length) continue
    const signature = `class ${name}`
    const lineNode = declaration.getNameNode() ?? declaration
    const lineNumber = lineNode.getStartLineNumber()
    trackSymbol({ name, file: relativePath, line: lineNumber, sourceText: declaration.getText() })
    addEntry(categories, {
      file: relativePath,
      line: lineNumber,
      kind: 'class',
      name,
      signature,
    })
  }
}

function processExportDeclarations(sourceFile: import('ts-morph').SourceFile, relativePath: string) {
  for (const declaration of sourceFile.getExportDeclarations()) {
    const moduleSpecifier = declaration.getModuleSpecifierValue()
    if (!moduleSpecifier) continue
    for (const specifier of declaration.getNamedExports()) {
      const exportName = specifier.getNameNode().getText()
      const alias = specifier.getAliasNode()?.getText()
      const symbolName = alias ?? exportName
      const categories = classifySymbol(symbolName, relativePath, declaration.getText())
      if (!categories.length) continue
      const signature = buildExportSignature(exportName, alias, moduleSpecifier)
      const lineNumber = specifier.getStartLineNumber()
      trackSymbol({ name: symbolName, file: relativePath, line: lineNumber, sourceText: declaration.getText() })
      addEntry(categories, {
        file: relativePath,
        line: lineNumber,
        kind: 're-export',
        name: symbolName,
        signature,
      })
    }
  }
}

function classifySymbol(symName: string, filePath: string, sourceText: string): CategoryId[] {
  const normalizedPath = filePath.replace(/\\/g, '/')
  if (EXCLUDE_PATHS.some((pattern) => pattern.test(normalizedPath))) return []
  const hits = new Set<CategoryId>()
  const snippet = sourceText.slice(0, 2000)
  for (const [cat, patterns] of Object.entries(CATEGORIES) as [CategoryId, RegExp[]][]) {
    const matched = patterns.some((pattern) =>
      pattern.test(symName) || pattern.test(normalizedPath) || pattern.test(snippet),
    )
    if (matched) hits.add(cat)
  }
  return Array.from(hits)
}

function scoreSymbol(name: string, file: string): number {
  let score = 0
  if (/(?:insertNode|applyPresetToNodes|serializeNode|stableStringify)/.test(name)) score += 5
  if (name === 'insertNode') score += 3
  const normalized = file.split('\\').join('/')
  if (normalized.includes("lib/dnd/") || normalized.includes("lib/registry/") || normalized.includes("lib/export/")) score += 2
  if (normalized.includes("leftpane/Palette")) score += 1
  return score
}

function trackSymbol(record: SymbolRecord) {
  const key = `${record.file}:${record.line}:${record.name}`
  if (symbolKeys.has(key)) return
  symbolKeys.add(key)
  const snippet = record.sourceText.length > 4000 ? record.sourceText.slice(0, 4000) : record.sourceText
  symbolRecords.push({ ...record, sourceText: snippet })
}

function addEntry(categoryIds: CategoryId[], entry: Entry) {
  for (const categoryId of categoryIds) {
    const key = `${categoryId}|${entry.file}|${entry.line}|${entry.name}|${entry.signature}`
    if (seen.has(key)) continue
    seen.add(key)
    const bucket = categoryResults.get(categoryId)
    if (bucket) bucket.push({ ...entry })
  }
}

function buildFunctionSignature(declaration: import('ts-morph').FunctionDeclaration): string {
  const name = declaration.getName() ?? 'anonymous'
  const callable = getCallableSignature(name, declaration)
  return callable ? `function ${callable}` : `function ${name}()`
}

function buildVariableSignature(declaration: VariableDeclaration): string {
  const nameNode = declaration.getNameNode()
  const name = Node.isIdentifier(nameNode) ? nameNode.getText() : declaration.getName()
  const initializer = declaration.getInitializer()
  const callable = initializer ? getCallableSignature(name, initializer) : undefined
  if (callable) return `const ${callable}`
  const typeText = declaration.getType().getText(undefined, TypeFormatFlags.NoTruncation | TypeFormatFlags.UseFullyQualifiedType)
  const display = typeText && typeText !== 'any' ? `${name}: ${typeText}` : name
  return `const ${display}`
}

function getCallableSignature(name: string, node: Node): string | undefined {
  const type = typeChecker.getTypeAtLocation(node)
  const [signature] = type.getCallSignatures()
  if (!signature) return undefined
  const declaration = signature.getDeclaration()
  if (declaration) {
    const parameters = declaration.getParameters().map((param) => {
      const paramName = param.getNameNode()?.getText() ?? param.getName()
      const typeNode = param.getTypeNode()
      const paramType = typeNode?.getText() ?? param.getType().getText(undefined, TypeFormatFlags.NoTruncation | TypeFormatFlags.UseFullyQualifiedType)
      const optional = param.isOptional() ? '?' : ''
      return `${paramName}${optional}: ${paramType}`
    })
    const returnTypeNode = declaration.getReturnTypeNode()
    const returnType = returnTypeNode?.getText() ?? signature.getReturnType().getText(undefined, TypeFormatFlags.NoTruncation | TypeFormatFlags.UseFullyQualifiedType)
    return `${name}(${parameters.join(', ')}) => ${returnType}`
  }
  const fallback = type.getText(undefined, TypeFormatFlags.NoTruncation | TypeFormatFlags.UseFullyQualifiedType)
  return `${name}: ${fallback}`
}

function buildExportSignature(name: string, alias: string | undefined, moduleSpecifier: string): string {
  const aliasPart = alias ? ` as ${alias}` : ''
  return `export { ${name}${aliasPart} } from '${moduleSpecifier}'`
}

function emitEntry(_cat: CategoryId, file: string, name: string, signature: string): string {
  const short = normalizePath(file.startsWith(PROJECT_ROOT) ? file.slice(PROJECT_ROOT.length) : file)
  return `- \`${name}\` - ${codeSpan(truncate(signature))}  _${short}_`
}

function escapeMermaidId(value: string): string {
  return value.replace(/[^A-Za-z0-9_]/g, '_')
}

function codeSpan(value: string): string {
  return '`' + value.replace(/`/g, "\\`") + '`'
}

function truncate(text: string, limit = 160): string {
  if (text.length <= limit) return text
  return text.slice(0, limit - 3) + '...'
}

function loadBaseline(filePath: string): string[] {
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.filter((value): value is string => typeof value === 'string')
    }
  } catch {}
  return []
}

function normalizePath(value: string): string {
  return value.replace(/^[/\\]+/, '').replace(/\\/g, '/')
}

function toRelativePath(filePath: string): string {
  return normalizePath(path.relative(PROJECT_ROOT, filePath))
}

function isTopLevelVariable(declaration: VariableDeclaration): boolean {
  const statement = declaration.getVariableStatement()
  if (!statement) return false
  if (!statement.hasExportKeyword() && !statement.isDefaultExport()) return false
  return statement.getFirstAncestorByKind(SyntaxKind.SourceFile) === declaration.getSourceFile()
}















