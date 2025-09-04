import fs from 'fs'
import path from 'path'

export interface LayoutSlots {
  header: { height: number }
  sidebar: { width: number }
  footer: { height: number }
}

export interface LayoutTemplate {
  slots: LayoutSlots
}

const ROOT = process.cwd()
const DIR = path.join(ROOT, 'layoutTemplates')

function ensureDir() {
  if (!fs.existsSync(DIR)) {
    fs.mkdirSync(DIR, { recursive: true })
  }
}

export function loadLayoutTemplate(id: string): LayoutTemplate {
  ensureDir()
  const file = path.join(DIR, `${id}.json`)
  if (fs.existsSync(file)) {
    try {
      const raw = fs.readFileSync(file, 'utf-8')
      return JSON.parse(raw) as LayoutTemplate
    } catch {
      /* ignore */
    }
  }
  return {
    slots: {
      header: { height: 64 },
      sidebar: { width: 240 },
      footer: { height: 48 },
    },
  }
}

export function saveLayoutTemplate(id: string, template: LayoutTemplate): void {
  ensureDir()
  const file = path.join(DIR, `${id}.json`)
  fs.writeFileSync(file, JSON.stringify(template, null, 2))
}
