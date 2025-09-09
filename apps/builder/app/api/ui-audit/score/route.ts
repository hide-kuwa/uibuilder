// apps/builder/app/api/ui-audit/score/route.ts
import { NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'
import { evaluateAudit, type ComponentNode } from '../../../../lib/ui-audit'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const slug = (url.searchParams.get('slug') || 'sample').replace(/[^\w\-]/g, '')
    const file = path.join(process.cwd(), 'public', 'pages', `${slug}.json`)

    if (!fs.existsSync(file)) {
      return NextResponse.json(
        {
          slug,
          scores: { contrast: 0, fontVariety: 0, gridSpacing: 0, alignment: 0, average: 0 },
          issues: { contrast: [], fontVariety: [], gridSpacing: [], alignment: [] },
          warning: 'page json not found',
        },
        { status: 200 }
      )
    }

    const txt = fs.readFileSync(file, 'utf8')
    const data = JSON.parse(txt)
    const tree: ComponentNode[] | null = Array.isArray(data?.tree)
      ? (data.tree as ComponentNode[])
      : (Array.isArray(data) ? (data as ComponentNode[]) : null)
    if (!tree) {
      return NextResponse.json(
        {
          slug,
          scores: { contrast: 0, fontVariety: 0, gridSpacing: 0, alignment: 0, average: 0 },
          issues: { contrast: [], fontVariety: [], gridSpacing: [], alignment: [] },
          warning: 'invalid page json (expected { tree: ComponentNode[] })',
        },
        { status: 200 }
      )
    }

    const { scores, issues, issuesDetail } = evaluateAudit(tree)
    return NextResponse.json({ slug, scores, issues, issuesDetail }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      {
        error: String(err?.message || err || 'ui-audit failed'),
        scores: { contrast: 0, fontVariety: 0, gridSpacing: 0, alignment: 0, average: 0 },
        issues: { contrast: [], fontVariety: [], gridSpacing: [], alignment: [] },
      },
      { status: 200 }
    )
  }
}
