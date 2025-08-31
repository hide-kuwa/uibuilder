import { NextResponse } from 'next/server'
import { getOctokit, GH_OWNER, GH_REPO, GH_DEFAULT_BRANCH } from '@/lib/gh/octokit'

type Req = { projectId?: string; project: any; branchPrefix?: string }

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Req
    const projectId = body.projectId || body.project?.meta?.id || 'project'
    const branchPrefix = body.branchPrefix || 'builder'
    const octokit = getOctokit()
    if (!GH_OWNER || !GH_REPO) return NextResponse.json({ error: 'GH_OWNER or GH_REPO missing' }, { status: 400 })

    const baseRef = await octokit.rest.git.getRef({ owner: GH_OWNER, repo: GH_REPO, ref: `heads/${GH_DEFAULT_BRANCH}` })
    const baseSha = baseRef.data.object.sha
    const branch = `${branchPrefix}/${projectId}-${Date.now()}`
    await octokit.rest.git.createRef({ owner: GH_OWNER, repo: GH_REPO, ref: `refs/heads/${branch}`, sha: baseSha })

    const path = `projects/${projectId}/project.json`
    let sha: string | undefined = undefined
    try {
      const existing = await octokit.rest.repos.getContent({ owner: GH_OWNER, repo: GH_REPO, path, ref: branch })
      if (!Array.isArray(existing.data) && 'sha' in existing.data) sha = (existing.data as any).sha
    } catch {}

    const content = Buffer.from(JSON.stringify(body.project, null, 2)).toString('base64')
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: GH_OWNER,
      repo: GH_REPO,
      path,
      message: `chore(builder): update ${projectId} via Reflect`,
      content,
      branch,
      sha,
    })

    const pr = await octokit.rest.pulls.create({
      owner: GH_OWNER,
      repo: GH_REPO,
      title: `chore(builder): update ${projectId}`,
      head: branch,
      base: GH_DEFAULT_BRANCH,
      body: `Project: ${projectId}\nPath: ${path}`,
    })

    return NextResponse.json({ branch, prUrl: pr.data.html_url, prNumber: pr.data.number })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
