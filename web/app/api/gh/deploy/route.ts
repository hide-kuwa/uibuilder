import { NextResponse } from 'next/server'
import { getOctokit, GH_OWNER, GH_REPO, GH_DEFAULT_BRANCH } from '@/lib/gh/octokit'

type Req = { ref?: string; workflowId?: string; inputs?: Record<string, string> }

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Req
    const ref = body.ref || GH_DEFAULT_BRANCH
    const workflow_id = body.workflowId || 'deploy.yml'
    const octokit = getOctokit()
    if (!GH_OWNER || !GH_REPO) return NextResponse.json({ error: 'GH_OWNER or GH_REPO missing' }, { status: 400 })
    await octokit.rest.actions.createWorkflowDispatch({ owner: GH_OWNER, repo: GH_REPO, workflow_id, ref, inputs: body.inputs })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
