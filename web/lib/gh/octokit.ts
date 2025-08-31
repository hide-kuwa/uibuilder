import { Octokit } from 'octokit'

export function getOctokit() {
  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error('GITHUB_TOKEN missing')
  return new Octokit({ auth: token })
}

export const GH_OWNER = process.env.GH_OWNER || ''
export const GH_REPO = process.env.GH_REPO || ''
export const GH_DEFAULT_BRANCH = process.env.GH_DEFAULT_BRANCH || 'main'
