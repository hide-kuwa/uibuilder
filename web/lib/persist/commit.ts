/**
 * v13-5: 二段階コミット保存（pending→committed）
 * - IndexedDB(Dexie) を「サーバー擬き」のコミット先として利用（MVP）
 * - リトライ（指数バックオフ＋ジッター）、重複防止（最新版のみコミット）
 */
import Dexie, { type Table } from 'dexie'

type CommitRow = { k: string; ts: number; data: any }

class CommitDB extends Dexie {
  commits!: Table<CommitRow, string>
  constructor() {
    super('ui_builder_commits_v1')
    this.version(1).stores({
      commits: '&k',
    })
  }
}
const db = new CommitDB()

/** サーバー相当：最新版として保存（id=k:'latest'） */
export async function putCommitToIndexedDB(doc: any) {
  await db.commits.put({ k: 'latest', ts: Date.now(), data: doc })
}

export type RetryOpts = { maxAttempts?: number; baseDelayMs?: number }

export async function commitWithRetry(
  doc: any,
  opts: RetryOpts = { maxAttempts: 5, baseDelayMs: 600 },
): Promise<void> {
  const max = Math.max(1, opts.maxAttempts ?? 5)
  const base = Math.max(100, opts.baseDelayMs ?? 600)
  let lastErr: any = null
  for (let i = 0; i < max; i++) {
    try {
      await putCommitToIndexedDB(doc)
      return
    } catch (e) {
      lastErr = e
      const jitter = Math.random() * 150
      const backoff = base * Math.pow(2, i) + jitter
      await delay(backoff)
    }
  }
  throw lastErr ?? new Error('commit failed')
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}
