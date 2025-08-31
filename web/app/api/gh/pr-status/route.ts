import { NextResponse } from 'next/server'
import { getOctokit, GH_OWNER, GH_REPO } from '@/lib/gh/octokit'

type Req = { prNumber: number }

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Req
    if (!body?.prNumber) return NextResponse.json({ error: 'prNumber required' }, { status: 400 })
    const oc = getOctokit()
    const pr = await oc.rest.pulls.get({ owner: GH_OWNER, repo: GH_REPO, pull_number: body.prNumber })
    const headSha = pr.data.head.sha
    const checks = await oc.rest.checks.listForRef({ owner: GH_OWNER, repo: GH_REPO, ref: headSha, per_page: 100 })
    return NextResponse.json({
      number: pr.data.number,
      state: pr.data.state,
      merged: pr.data.merged,
      headSha,
      htmlUrl: pr.data.html_url,
      checks: checks.data.check_runs.map(r => ({
        name: r.name,
        status: r.status,
        conclusion: r.conclusion,
        htmlUrl: r.html_url,
        startedAt: r.started_at,
        completedAt: r.completed_at,
      })),
    })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
