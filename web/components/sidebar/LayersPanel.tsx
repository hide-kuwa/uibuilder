'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { computeLayerRows, highlightSegments, type LayerRow } from '@/lib/layers/filter'

/**
 * v13-3: レイヤー仮想化（折りたたみ/検索連動）
 * - 固定行高（24px）のウィンドウ描画
 * - 折りたたみ状態は localStorage に自動保存
 * - 検索語にヒットしたノードの祖先は自動展開、ヒット文字は <mark>
 */
export default function LayersPanel() {
  const tree = useEditorStore((s) => s.tree)
  const selectedIds = useEditorStore((s) => s.selectedIds)
  const select = useEditorStore((s) => s.select)

  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useLocalCollapsed('ui.layers.collapsed')

  // rows 計算（検索時は祖先自動展開）
  const { rows, expandedBecauseSearch } = useMemo(
    () => computeLayerRows(tree, collapsed, query),
    [tree, collapsed, query],
  )

  // ========== 仮想化 ==========
  const rowHeight = 24
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [viewportH, setViewportH] = useState(320)
  const [scrollTop, setScrollTop] = useState(0)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setViewportH(el.clientHeight))
    ro.observe(el)
    setViewportH(el.clientHeight)
    const onScroll = () => setScrollTop(el.scrollTop)
    el.addEventListener('scroll', onScroll)
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', onScroll)
    }
  }, [])
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - 4)
  const visibleCount = Math.ceil(viewportH / rowHeight) + 8
  const end = Math.min(rows.length, start + visibleCount)
  const offsetY = start * rowHeight

  // ========== 操作 ==========
  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const expandAll = () => setCollapsed(new Set())
  const collapseAll = () => {
    const s = new Set<string>()
    for (const r of rows) if (r.hasChildren) s.add(r.id)
    setCollapsed(s)
  }

  return (
    <div className="flex flex-col h-full">
      {/* ツールバー */}
      <div className="p-2 flex items-center gap-2 border-b border-zinc-800">
        <input
          className="flex-1 px-2 py-1 rounded bg-zinc-900 border border-zinc-700 outline-none text-sm"
          placeholder="レイヤー検索（名前）"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs hover:bg-zinc-800"
          onClick={expandAll}
          title="すべて展開"
        >
          展開
        </button>
        <button
          className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs hover:bg-zinc-800"
          onClick={collapseAll}
          title="すべて折りたたみ"
        >
          折畳
        </button>
      </div>

      {/* リスト（仮想化） */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div style={{ height: rows.length * rowHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {rows.slice(start, end).map((r) => (
              <Row
                key={r.id}
                row={r}
                query={query}
                isCollapsed={collapsed.has(r.id) && !expandedBecauseSearch.has(r.id)}
                isSelected={selectedIds.includes(r.id)}
                onToggle={() => toggleCollapse(r.id)}
                onSelect={() => select([r.id])}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Row(props: {
  row: LayerRow
  query: string
  isCollapsed: boolean
  isSelected: boolean
  onToggle: () => void
  onSelect: () => void
}) {
  const { row, query, isCollapsed, isSelected, onToggle, onSelect } = props
  const hasChild = row.hasChildren
  const segs = useMemo(() => highlightSegments(row.name, query), [row.name, query])
  return (
    <div
      className={`flex items-center h-6 text-sm px-2 select-none ${
        isSelected ? 'bg-sky-500/20' : 'hover:bg-zinc-800/60'
      }`}
      style={{ paddingLeft: 8 + row.depth * 12 }}
      onClick={onSelect}
    >
      <button
        className={`mr-1 w-4 text-xs text-zinc-400 ${hasChild ? 'opacity-100' : 'opacity-30'}`}
        onClick={(e) => {
          e.stopPropagation()
          if (hasChild) onToggle()
        }}
        title={hasChild ? (isCollapsed ? '展開' : '折りたたみ') : '子要素なし'}
      >
        {hasChild ? (isCollapsed ? '▶' : '▼') : '•'}
      </button>
      <span className="truncate">
        {segs.map((s, i) =>
          s.hit ? (
            <mark key={i} className="bg-amber-300/40 text-amber-100 rounded px-0.5">
              {s.text}
            </mark>
          ) : (
            <span key={i} className="text-zinc-200">
              {s.text}
            </span>
          ),
        )}
      </span>
      {row.type && (
        <span className="ml-2 text-[10px] uppercase tracking-wide text-zinc-500">{row.type}</span>
      )}
      {row.matched && query && (
        <span className="ml-2 text-[10px] text-amber-300">hit</span>
      )}
    </div>
  )
}

function useSetState<T>(initial: Set<T>) {
  const [setVal, setSetVal] = React.useState<Set<T>>(initial)

  const apply = React.useCallback(
    (next: Set<T> | ((prev: Set<T>) => Set<T>)) => {
      setSetVal((prev) => {
        try {
          if (typeof next === 'function') {
            return (next as (p: Set<T>) => Set<T>)(prev)
          }
          return new Set(next)
        } catch {
          return prev
        }
      })
    },
    []
  )

  return [setVal, apply] as const
}

// ===== localStorage 永続化（Set<string>） =====
function useLocalCollapsed(key: string) {
  const initial = React.useMemo(() => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return new Set<string>()
      const arr: string[] = JSON.parse(raw)
      return new Set(arr)
    } catch {
      return new Set<string>()
    }
  }, [key])

  const [setVal, apply] = useSetState(initial)

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify([...setVal]))
      } catch {
        /* no-op */
      }
    }, 150)
    return () => clearTimeout(id)
  }, [key, setVal])

  return [setVal, apply] as const
}

