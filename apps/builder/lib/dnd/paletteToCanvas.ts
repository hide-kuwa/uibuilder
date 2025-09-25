"use client";

import type { DragEvent as ReactDragEvent } from 'react'

const DT_KEY = 'application/x-uib-palette-id'

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

