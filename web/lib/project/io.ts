import type { Project } from './types'
import { idbGet, idbSet } from './idb'
import { b64uDecode } from './base64'

const SCHEMA = 1
const LOCAL_KEY = 'project:local'

export async function loadProjectFromQuery(): Promise<Project | null> {
  const search = typeof window !== 'undefined' ? window.location.search : ''
  const p = new URLSearchParams(search)
  const id = p.get('p')
  const d = p.get('d')
  if (d) {
    try {
      const json = b64uDecode(d)
      const parsed = JSON.parse(json)
      return normalizeProject(parsed, id || parsed?.meta?.id || null)
    } catch {
      return null
    }
  }
  if (id) {
    const pj = await idbGet<Project>('project:' + id)
    return pj ? normalizeProject(pj, id) : null
  }
  const local = await idbGet<Project>(LOCAL_KEY)
  return local ? normalizeProject(local, local.meta?.id || null) : null
}

export async function saveProject(p: Project): Promise<void> {
  const id = p.meta?.id || 'local'
  const key = id === 'local' ? LOCAL_KEY : 'project:' + id
  await idbSet(key, p)
  if (id === 'local') await idbSet(LOCAL_KEY, p)
}

export function makeProject(elements: any[], meta?: Project['meta']): Project {
  return { schemaVersion: SCHEMA, meta: meta || { id: 'local', name: 'Local Project' }, elements, designTokens: {}, assets: [] }
}

function normalizeProject(p: any, forceId: string | null): Project {
  const id = forceId || p?.meta?.id || 'local'
  return {
    schemaVersion: typeof p?.schemaVersion === 'number' ? p.schemaVersion : SCHEMA,
    meta: { id, name: p?.meta?.name || 'Project ' + id },
    designTokens: p?.designTokens || {},
    elements: Array.isArray(p?.elements) ? p.elements : [],
    assets: p?.assets || [],
  }
}
