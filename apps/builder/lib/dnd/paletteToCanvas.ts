"use client";

import type { DragEvent as ReactDragEvent } from 'react'
import type { ComponentNode } from '@chizu/types'
import { instantiatePaletteId } from '@/lib/registry/instantiate'

export const DT_KEY = 'application/x-uib-palette-id'

export function startPaletteDrag(ev: ReactDragEvent, compId: string) {
  if (!ev.dataTransfer) return
  ev.dataTransfer.setData(DT_KEY, compId)
  ev.dataTransfer.effectAllowed = 'copy'
}

function currentPageId(): string {
  if (typeof document === 'undefined') return 'page-root'
  const el = document.querySelector('[data-page-id]')
  return (el && el.getAttribute('data-page-id')) || 'page-root'
}

type DropTarget = { slotId: string; containerNodeId: string; index: number }

type InsertFn = (node: ComponentNode, opts: { parentId: string; index: number }) => ComponentNode | void

type CanvasDropDeps = {
  getDef?: (id: string) => any
  createNode?: (def: any, opts?: { slotKey?: string }) => any
  callInsert?: (parentId: string, index: number, node: any) => void
  select?: (id: string, slotId?: string) => void
}

function deriveDropTarget(clientX: number, clientY: number): DropTarget {
  const fallback: DropTarget = { slotId: 'page.root', containerNodeId: currentPageId(), index: Number.POSITIVE_INFINITY }
  if (typeof document === 'undefined') {
    return fallback
  }
  const at = document.elementFromPoint(clientX, clientY) as HTMLElement | null
  if (!at) return fallback
  const separator = at.closest('[data-drop-sep="true"]') as HTMLElement | null
  if (separator) {
    const slotHost = separator.closest('[data-slot]') as HTMLElement | null
    const slotId = slotHost?.getAttribute('data-slot') || fallback.slotId
    const containerNodeId = slotHost?.getAttribute('data-node-id') || fallback.containerNodeId
    const rawIndex = Number(separator.getAttribute('data-child-index'))
    const index = Number.isFinite(rawIndex) ? rawIndex : Number.POSITIVE_INFINITY
    return { slotId, containerNodeId, index }
  }
  const slotHost = at.closest('[data-slot]') as HTMLElement | null
  if (!slotHost) return fallback
  const slotId = slotHost.getAttribute('data-slot') || fallback.slotId
  const containerNodeId = slotHost.getAttribute('data-node-id') || fallback.containerNodeId
  return { slotId, containerNodeId, index: Number.POSITIVE_INFINITY }
}

export function applyPaletteDrop(
  paletteId: string,
  parentId: string,
  index: number,
  insert: InsertFn,
  select?: (id: string) => void,
) {
  const node = instantiatePaletteId(paletteId, { parentId, index })
  const inserted = insert(node, { parentId, index }) as ComponentNode | undefined
  const finalNode = inserted ?? node
  try { select?.(finalNode.id) } catch {}
}

function enhanceNodeFromRegistry(
  paletteId: string,
  slotId: string | undefined,
  draft: ComponentNode,
  deps: CanvasDropDeps,
): ComponentNode {
  const { getDef, createNode } = deps
  if (!getDef || !createNode) return draft
  try {
    const def = getDef(paletteId)
    if (!def) return draft
    const node = createNode(def, { slotKey: slotId }) as ComponentNode | undefined
    return node ?? draft
  } catch {
    return draft
  }
}

export function handleCanvasDrop(event: DragEvent, deps: CanvasDropDeps) {
  const dt = event.dataTransfer
  if (!dt) return
  const paletteId = dt.getData(DT_KEY)
  if (!paletteId) return

  const target = deriveDropTarget(event.clientX, event.clientY)
  const { callInsert } = deps
  if (!callInsert) return

  const select = deps.select ? (id: string) => deps.select?.(id, target.slotId) : undefined

  applyPaletteDrop(paletteId, target.containerNodeId, target.index, (draft, opts) => {
    const prepared = enhanceNodeFromRegistry(paletteId, target.slotId, draft, deps)
    callInsert(opts.parentId, opts.index, prepared)
    return prepared
  }, select)
}
