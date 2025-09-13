'use client'
import { useEffect, useRef, useState } from 'react'
import { useCanvasStore } from '@/stores/canvas'
import { useHistoryStore } from '@/stores/history'
import type { XY, Size } from '@/stores/canvas'
import { snapToGrid } from '@/lib/snap'
import { computeSnapWithGuides } from '@/lib/guides'
import DraggableNodeWrapper from './DraggableNodeWrapper'
import { rafBatch } from '@/lib/perf/rafBatch'

type Props = {
  id: string
  label: string
  initial?: XY
  size?: Size         // builderノードの size を渡せる
  z?: number
  locked?: boolean
  onCommit?: (xy: XY, sz?: Size) => void
}

export default function DraggableNode({
  id, label, initial, size = { w: 160, h: 96 }, z = 0, locked = false, onCommit,
}: Props) {
  const {
    nodePos, setNodePos, moveNodes, nodeSize, setNodeSize, scale,
    selectedIds, toggleSelect, setSelectedIds,
    getGroupMembers, groupSelectEnabled,
    snapEnabled, gridSize, snapThreshold,
    setGuides, clearGuides,
  } = useCanvasStore()
  const record = useHistoryStore(s => s.record)

  // サイズをストアに同期（ガイド用）
  useEffect(() => { useCanvasStore.getState().setNodeSize(id, size) }, [id, size.w, size.h])

  const pos = nodePos[id] ?? initial ?? { x: 0, y: 0 }
  const curSize = nodeSize[id] ?? size
  const selected = selectedIds.includes(id)
  const [dragStart, setDragStart] = useState<{ x: number; y: number; base: XY } | null>(null)
  const [resizing, setResizing] = useState<null | { dir: string; sx: number; sy: number; baseP: XY; baseS: Size }>(null)

  // rAF-batched updaters to sustain 60fps under heavy pointermove
  const dragStartRef = useRef(dragStart)
  useEffect(() => { dragStartRef.current = dragStart }, [dragStart])
  const batchedResize = useRef<null | ((pos: XY, size: Size) => void)>(null)
  const batchedMoveSingle = useRef<null | ((pos: XY, vxs: any[], hys: any[]) => void)>(null)
  const batchedMoveMulti = useRef<null | ((dx: number, dy: number, cx: number, cy: number) => void)>(null)
  useEffect(() => {
    batchedResize.current = rafBatch((pos: XY, size: Size) => {
      setNodePos(id, pos)
      setNodeSize(id, size)
      setGuides([], [])
    })
    batchedMoveSingle.current = rafBatch((pos: XY, vxs: any[], hys: any[]) => {
      setNodePos(id, pos)
      setGuides(vxs, hys)
    })
    batchedMoveMulti.current = rafBatch((dx: number, dy: number, cx: number, cy: number) => {
      moveNodes(selectedIds, dx, dy)
      const ds = dragStartRef.current
      if (ds) setDragStart({ ...ds, x: cx, y: cy })
      setGuides([], [])
    })
  }, [id, moveNodes, selectedIds, setGuides, setNodePos, setNodeSize])

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (locked || resizing) return
    e.currentTarget.setPointerCapture(e.pointerId)
    // ★ まず履歴を記録（ドラッグ操作の前に）
    record()

    const multi = e.metaKey || e.ctrlKey
    const alreadySelected = selectedIds.includes(id)

    // ★ グループ選択（有効時）
    if (!multi && groupSelectEnabled) {
      const members = getGroupMembers(id)
      if (members.length > 1) {
        setSelectedIds(members)
      } else if (!alreadySelected) {
        setSelectedIds([id])
      }
    } else {
      // 従来挙動
      if (multi) toggleSelect(id, true)
      else if (!alreadySelected) setSelectedIds([id])
    }

    setDragStart({ x: e.clientX, y: e.clientY, base: pos })
  }

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (locked) return
    // リサイズ中
    if (resizing) {
      const dx = (e.clientX - resizing.sx) / scale
      const dy = (e.clientY - resizing.sy) / scale
      let { x, y } = resizing.baseP
      let { w, h } = resizing.baseS
      if (resizing.dir.includes('e')) w = Math.max(80, w + dx)
      if (resizing.dir.includes('s')) h = Math.max(60, h + dy)
      if (resizing.dir.includes('w')) { w = Math.max(80, w - dx); x = x + dx }
      if (resizing.dir.includes('n')) { h = Math.max(60, h - dy); y = y + dy }
      // グリッド適用（任意）
      const snappedPos = snapEnabled ? snapToGrid({ x, y }, gridSize, snapThreshold) : { x, y }
      batchedResize.current?.(snappedPos, { w: Math.round(w), h: Math.round(h) })
      return
    }

    // ドラッグ中
    if (!dragStart) return
    const dx = (e.clientX - dragStart.x) / scale
    const dy = (e.clientY - dragStart.y) / scale

    if (selectedIds.length <= 1) {
      const raw = { x: dragStart.base.x + dx, y: dragStart.base.y + dy }
      // 1) グリッド → 2) ガイドで微調整（両方表示）
      const grid = snapEnabled ? snapToGrid(raw, gridSize, snapThreshold) : raw
      const { x, y, vxs, hys } = computeSnapWithGuides(id, grid, curSize, snapThreshold)
      batchedMoveSingle.current?.({ x, y }, vxs, hys)
    } else {
      batchedMoveMulti.current?.(dx, dy, e.clientX, e.clientY)
    }
  }

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch {}
    if (resizing) {
      setResizing(null)
      clearGuides()
      onCommit?.(useCanvasStore.getState().nodePos[id] ?? pos, useCanvasStore.getState().nodeSize[id] ?? curSize)
      return
    }
    if (!dragStart) return
    setDragStart(null)
    clearGuides()
    const cur = useCanvasStore.getState().nodePos[id] ?? pos
    onCommit?.(cur, useCanvasStore.getState().nodeSize[id] ?? curSize)
  }

  // リサイズハンドル
  const mkHandle = (dir: string, style: React.CSSProperties) => (
    <div
      key={dir}
      className="absolute z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-white bg-indigo-500 shadow"
      style={style}
      onPointerDown={(e) => {
        if (locked) return
        e.stopPropagation()
        e.currentTarget.setPointerCapture(e.pointerId)
        setResizing({ dir, sx: e.clientX, sy: e.clientY, baseP: pos, baseS: curSize })
      }}
      onPointerUp={(e)=>{ try{ e.currentTarget.releasePointerCapture(e.pointerId) }catch{}; setResizing(null) }}
    />
  )

  const content = (
    <>
      <div className="flex items-center justify-between">
        <div>{label}</div>
        {locked && <div className="rounded bg-gray-800/70 px-1.5 py-0.5 text-[10px] text-white">LOCK</div>}
      </div>
      <div className="mt-1 text-[10px] text-gray-700/80">
        {selected ? (resizing ? 'resizing…' : 'drag / ⌘(Ctrl)+Click で選択切替') : 'drag to move'}
      </div>

      {/* リサイズ：単体選択時のみ */}
      {selected && !locked && (
        <>
          {mkHandle('nw', { left: 0, top: 0 })}
          {mkHandle('n',  { left: '50%', top: 0 })}
          {mkHandle('ne', { left: '100%', top: 0 })}
          {mkHandle('w',  { left: 0, top: '50%' })}
          {mkHandle('e',  { left: '100%', top: '50%' })}
          {mkHandle('sw', { left: 0, top: '100%' })}
          {mkHandle('s',  { left: '50%', top: '100%' })}
          {mkHandle('se', { left: '100%', top: '100%' })}
        </>
      )}
    </>
  )

  return (
    <DraggableNodeWrapper id={id}>
      <div
        style={{
          width: curSize.w,
          height: curSize.h,
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          touchAction: 'none',
          zIndex: z,
        }}
        className={`absolute select-none rounded-xl border p-3 text-sm shadow-sm ${selected ? 'ring-2 ring-indigo-400' : ''} ${locked ? 'opacity-70' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {content}
      </div>
    </DraggableNodeWrapper>
  )
}
