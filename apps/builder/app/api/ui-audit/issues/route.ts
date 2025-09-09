// apps/builder/app/api/ui-audit/issues/route.ts
import { NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'
import { evaluateAudit, type ComponentNode } from '../../../../lib/ui-audit'
import type { AuditIssue } from '../../../../lib/audit/types'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const slug = (url.searchParams.get('slug') || 'sample').replace(/[^\w\-]/g, '')
    const file = path.join(process.cwd(), 'public', 'pages', `${slug}.json`)
    if (!fs.existsSync(file)) return NextResponse.json([])
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
    const tree: ComponentNode[] | null = Array.isArray(raw?.tree)
      ? (raw.tree as ComponentNode[])
      : (Array.isArray(raw) ? (raw as ComponentNode[]) : null)
    if (!tree) return NextResponse.json([])
    const { issues, issuesDetail } = evaluateAudit(tree)

    const list: AuditIssue[] = []
    // Contrast with details
    for (const d of issuesDetail.contrast || []) {
      list.push({
        id: `contrast:${d.id}`,
        kind: 'contrast',
        nodeId: d.id,
        slug,
        message: `contrast ${d.ratio?.toFixed?.(2) ?? '-'} (required ${d.required.toFixed(1)})`,
        payload: { level: d.level, ratio: d.ratio, required: d.required, textColor: d.textColor, bgColor: d.bgColor },
        scoreImpact: 2,
      })
    }
    // Spacing (grid8)
    for (const id of issues.gridSpacing || []) {
      list.push({ id: `grid8:${id}`, kind: 'grid8', nodeId: id, slug, message: 'Spacing off 8px grid', scoreImpact: 1 })
    }
    // Alignment
    for (const id of issues.alignment || []) {
      list.push({ id: `alignment:${id}`, kind: 'alignment', nodeId: id, slug, message: 'Not aligned to L/R columns', scoreImpact: 1 })
    }
    // fontVariety/a11yHeading currently not emitted

    return NextResponse.json(list)
  } catch (err) {
    return NextResponse.json([])
  }
}

