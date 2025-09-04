import type { BuilderNode } from '../schemas/page'

export interface PageTemplate {
  id: string
  name: string
  layoutId: string
  nodes: BuilderNode[]
  notes?: string
}

const KEY = 'page-templates-v1'

const uid = () => Math.random().toString(36).slice(2, 9)

function loadTemplates(): PageTemplate[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as PageTemplate[]) : []
  } catch {
    return []
  }
}

function saveTemplates(arr: PageTemplate[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(arr))
  } catch {}
}

export function getTemplates(): PageTemplate[] {
  return loadTemplates()
}

export function saveTemplate(t: Omit<PageTemplate, 'id'> & { id?: string }): string {
  const arr = loadTemplates()
  const id = t.id ?? uid()
  const tpl: PageTemplate = { id, ...t }
  const idx = arr.findIndex((x) => x.id === id)
  const next = idx >= 0 ? arr.map((x) => (x.id === id ? tpl : x)) : [...arr, tpl]
  saveTemplates(next)
  return id
}

export function deleteTemplate(id: string) {
  const next = loadTemplates().filter((t) => t.id !== id)
  saveTemplates(next)
}

export function exportTemplates(): string {
  return JSON.stringify(loadTemplates(), null, 2)
}

export function importTemplates(json: string) {
  try {
    const arr = JSON.parse(json)
    if (Array.isArray(arr)) saveTemplates(arr as PageTemplate[])
  } catch {}
}
