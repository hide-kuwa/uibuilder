// append-only: new server page to render docs/OpsNotes-2025-09-08.md
import fs from 'node:fs'
import path from 'node:path'

export const dynamic = 'force-dynamic' // ensure fresh read in dev

export default function OpsNotesPage() {
  let body = ''
  try {
    const p = path.join(process.cwd(), 'docs', 'OpsNotes-2025-09-08.md')
    body = fs.readFileSync(p, 'utf8')
  } catch {
    body =
      'docs/OpsNotes-2025-09-08.md not found. Ensure the file exists in the repo root.'
  }
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Ops Notes (2025-09-08)</h1>
      <p className="text-sm opacity-70">
        Rendered from <code>docs/OpsNotes-2025-09-08.md</code>（append-only）
      </p>
      <pre className="whitespace-pre-wrap text-sm leading-6">{body}</pre>
    </div>
  )
}

