// apps/builder/lib/export/generate.ts
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { normalizeNodes, serializeNodes, type SerializableNode } from './serializeNode'
import { stableStringify } from './stableStringify'

const countNodes = (nodes: SerializableNode[]): number =>
  nodes.reduce((total, node) => total + 1 + countNodes(node.children ?? []), 0)

const buildTsx = (nodes: SerializableNode[]) => {
  const lines: string[] = [
    "import React from 'react'",
    '',
    'export default function GeneratedPage(){',
    '  return (',
    '    <>',
  ]
  const body = serializeNodes(nodes, 6)
  if (body) lines.push(body)
  lines.push('    </>', '  )', '}', '')
  return lines.join('\n')
}

export async function generateExport(slug: string) {
  const file = path.join(process.cwd(), 'public', 'pages', `${slug}.json`)
  const raw = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null
  const tree = normalizeNodes(raw)
  const tsx = buildTsx(tree)
  const tokens: string[] = Array.isArray(raw?.tokens) ? [...raw.tokens] : []
  const manifest = {
    id: slug,
    generatedAt: new Date().toISOString(),
    nodes: countNodes(tree),
  }
  const base = { tsx, manifest, tokens }
  const contentHash = crypto.createHash('sha256').update(stableStringify(base)).digest('hex')
  return { ...base, contentHash }
}
