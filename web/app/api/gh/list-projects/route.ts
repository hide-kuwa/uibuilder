import { NextResponse } from 'next/server'
import { getOctokit, GH_OWNER, GH_REPO, GH_DEFAULT_BRANCH } from '@/lib/gh/octokit'

type Req = { ref?: string }

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(()=>({}))) as Req
    const ref = body.ref || GH_DEFAULT_BRANCH
    const oc = getOctokit()
    const res = await oc.rest.repos.getContent({ owner: GH_OWNER, repo: GH_REPO, path: 'projects', ref })
    if (!Array.isArray(res.data)) return NextResponse.json({ items: [] })
    const dirs = res.data.filter((e: any) => e.type === 'dir').map((e: any) => e.name)
    return NextResponse.json({ items: dirs })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e), items: [] }, { status: 500 })
  }
}
