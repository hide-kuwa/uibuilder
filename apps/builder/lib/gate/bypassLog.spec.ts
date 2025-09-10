import { describe, it, expect, vi } from 'vitest'
import { postBypassLog } from './bypassLog'

describe('bypass log', () => {
  it('posts to /api/audit-log', async () => {
    const fetchMock: any = vi.fn().mockResolvedValue({ ok: true })
    const res: any = await postBypassLog(fetchMock, { slug: 's', score: 65, user: 'u' })
    expect(fetchMock).toHaveBeenCalledWith('/api/audit-log', expect.any(Object))
    expect(res.ok).toBe(true)
  })
})

