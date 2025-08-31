import { NextResponse } from 'next/server'
import { getOctokit, GH_OWNER, GH_REPO, GH_DEFAULT_BRANCH } from '@/lib/gh/octokit'

type Req = { projectId: string; ref?: string; prNumber?: number }

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Req
    const oc = getOctokit()
    let ref = body.ref || GH_DEFAULT_BRANCH
    if (body.prNumber) {
      const pr = await oc.rest.pulls.get({ owner: GH_OWNER, repo: GH_REPO, pull_number: body.prNumber })
      ref = pr.data.head.sha
    }
    const path = `projects/${body.projectId}/project.json`
    const file = await oc.rest.repos.getContent({ owner: GH_OWNER, repo: GH_REPO, path, ref })
    if (Array.isArray(file.data)) return NextResponse.json({ error: 'not a file' }, { status: 400 })
    const content = Buffer.from((file.data as any).content, (file.data as any).encoding || 'base64').toString('utf8')
    const json = JSON.parse(content)
    return NextResponse.json({ project: json, ref })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
