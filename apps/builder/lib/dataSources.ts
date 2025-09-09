// apps/builder/lib/dataSources.ts
import type { EnvMode } from '@/stores/env'

async function fetchJsonSafe(url: string): Promise<any> {
  try {
    const r = await fetch(url, { cache: 'no-store' })
    if (!r.ok) return null
    return await r.json()
  } catch {
    return null
  }
}

export async function getLocalData(mode: EnvMode): Promise<any> {
  if (mode === 'mock') return (await fetchJsonSafe('/mock/local.json')) ?? {}
  return (await fetchJsonSafe('/api/data/local')) ?? (await fetchJsonSafe('/mock/local.json')) ?? {}
}

export async function getGlobalData(mode: EnvMode): Promise<any> {
  if (mode === 'mock') return (await fetchJsonSafe('/mock/global.json')) ?? {}
  return (await fetchJsonSafe('/api/data/global')) ?? (await fetchJsonSafe('/mock/global.json')) ?? {}
}

export async function getRuntimeForMode(mode: EnvMode) {
  const page = await getLocalData(mode)
  const app = await getGlobalData(mode)
  return { page, app }
}

