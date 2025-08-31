import { NextResponse } from 'next/server'
import { getOctokit, GH_OWNER, GH_REPO } from '@/lib/gh/octokit'

type Req = { workflowId?: string; per_page?: number }

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Req
    const oc = getOctokit()
    const workflow_id = body.workflowId || 'Deploy.yml'
    const per_page = body.per_page || 5
    const runs = await oc.rest.actions.listWorkflowRuns({
      owner: GH_OWNER,
      repo: GH_REPO,
      workflow_id,
      per_page,
    })
    return NextResponse.json({
      total: runs.data.total_count,
      items: runs.data.workflow_runs.map(r => ({
        id: r.id,
        status: r.status,
        conclusion: r.conclusion,
        event: r.event,
        url: r.html_url,
        headBranch: r.head_branch,
        headSha: r.head_sha,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
    })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
