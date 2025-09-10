// Find a successful workflow run for given workflow file/branch/commit.
// Prints run_id to stdout when found; exits 0 even if not found (caller handles skip).
import { setTimeout as wait } from 'node:timers/promises';

const repo = process.env.REPO;               // e.g. "owner/repo"
const workflowFile = process.env.WORKFLOW_FILE || 'test.yml';
const branch = process.env.BRANCH;           // e.g. "release/rc-2025-09-09"
const sha = process.env.COMMIT_SHA;          // commit SHA to prefer
const token = process.env.GITHUB_TOKEN;

if (!repo || !branch || !token) {
  console.error('Missing REPO/BRANCH/GITHUB_TOKEN');
  process.exit(0);
}

const headers = {
  'authorization': `Bearer ${token}`,
  'accept': 'application/vnd.github+json',
  'x-github-api-version': '2022-11-28',
};

async function fetchRuns() {
  const url = `https://api.github.com/repos/${repo}/actions/workflows/${encodeURIComponent(workflowFile)}/runs?branch=${encodeURIComponent(branch)}&status=completed&per_page=50`;
  const res = await fetch(url, { headers });
  if (!res.ok) return null;
  const json = await res.json();
  return Array.isArray(json.workflow_runs) ? json.workflow_runs : [];
}

for (let i = 0; i < 24; i++) { // ~6分待機（15s x 24）
  const runs = (await fetchRuns()) || [];
  const success = runs.filter(r => r.conclusion === 'success');
  let pick = success.find(r => r.head_sha === sha) || success.find(r => r.head_branch === branch) || success[0];
  if (pick) {
    process.stdout.write(String(pick.id));
    process.exit(0);
  }
  await wait(15000);
}
process.exit(0);
