import type { ComponentNode } from '@chizu/types'

type InsertAPI = (parentId: string | null, index: number, node: ComponentNode) => void | Promise<void>

let insertAPI: InsertAPI | null = null
let fallbackLogged = false

export function registerInsertAPI(api: InsertAPI | null) {
  insertAPI = api
}

export function callInsertAPI(parentId: string | null, index: number, node: ComponentNode) {
  if (insertAPI) {
    void insertAPI(parentId, index, node)
    return
  }
  if (typeof window === 'undefined') return
  if (!fallbackLogged) {
    fallbackLogged = true
    console.info('[builder.insertNode:fallback]', { parentId, index, node })
  }
  try {
    window.dispatchEvent(new CustomEvent('builder.insertNode', { detail: { parentId, index, node } }))
  } catch {}
}
