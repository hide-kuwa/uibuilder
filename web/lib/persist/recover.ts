export function getLastCommittedTsSafe(): number | null {
  try {
    // Prefer runtime-exposed snapshot.ts state if available
    // @ts-expect-error runtime probing
    const ts = (window as any).__snapshot?.lastCommittedTs
    return typeof ts === 'number' ? ts : null
  } catch { return null }
}

export async function restoreFromLatestStage(): Promise<void> {
  try {
    // Use existing API if present, otherwise fall back to reload
    // @ts-expect-error runtime probing
    const api = (window as any).__snapshot
    if (api?.rehydrateLatestFromStage) {
      await api.rehydrateLatestFromStage()
      return
    }
  } catch {}
  try { location.reload() } catch {}
}

