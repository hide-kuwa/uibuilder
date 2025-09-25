import type { ComponentNode, Page } from '@chizu/types'
import { FRAME_TYPE_MAP } from './constants'

export const jsonFetcher = (url: string) => fetch(url).then((res) => res.json())

export function clone<T>(value: T): T {
  try {
    return structuredClone(value)
  } catch {
    return JSON.parse(JSON.stringify(value)) as T
  }
}

export function cloneNodes(nodes?: ComponentNode[] | null): ComponentNode[] {
  if (!Array.isArray(nodes)) return []
  try {
    return structuredClone(nodes)
  } catch {
    return JSON.parse(JSON.stringify(nodes)) as ComponentNode[]
  }
}

export function buildPreviewTree(page: Page, frameId: string): ComponentNode[] {
  const type = FRAME_TYPE_MAP[frameId] ?? 'Frame_Basic'
  const slots: Record<string, ComponentNode[]> = {}
  slots.content = cloneNodes(page.content)
  const assignments = page.slotAssignments ?? {}
  for (const [slot, nodes] of Object.entries(assignments)) {
    slots[slot] = cloneNodes(nodes)
  }
  return [
    {
      id: 'frame-root',
      type,
      slots,
    },
  ]
}
