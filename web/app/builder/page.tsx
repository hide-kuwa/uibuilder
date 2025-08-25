'use client'
import React from 'react'
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  DragStartEvent,
  DragMoveEvent,
} from '@dnd-kit/core'
import { Palette } from '@/components/builder/Palette'
import { Canvas } from '@/components/builder/Canvas'
import { Inspector } from '@/components/builder/Inspector'
import { useBuilderStore, type Elm } from '@/store/builderStore'
import { collectSnapPoints, snapRect } from '@/lib/builder/snap'
import { PagesPanel } from '@/components/builder/PagesPanel'
import { usePageStore } from '@/store/pageStore'

export default function BuilderPage() {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))
  const canvasRef = React.useRef<HTMLDivElement>(null)
  const addFromPalette = useBuilderStore((s) => s.addFromPalette)
  const moveExisting = useBuilderStore((s) => s.move)
  const elements = useBuilderStore((s) => s.elements)
  const setDragDraft = useBuilderStore((s) => s.setDragDraft)
  const setGuides = useBuilderStore((s) => s.setGuides)
  const clearGuides = useBuilderStore((s) => s.clearGuides)
  const setElements = useBuilderStore((s) => s.setElements)

  const currentPageId = usePageStore((s) => s.currentPageId)
  const getTree = usePageStore((s) => s.getTree)
  const setTree = usePageStore((s) => s.setTree)

  const startRectRef = React.useRef<{ x: number; y: number; w: number; h: number } | null>(null)
  const snapPointsRef = React.useRef<ReturnType<typeof collectSnapPoints> | null>(null)

  const onDragStart = React.useCallback(
    (e: DragStartEvent) => {
      const data: any = e.active?.data?.current
      if (data?.from === 'canvas' && typeof data.id === 'string') {
        const elm = useBuilderStore.getState().elements.find((el) => el.id === data.id)
        if (!elm) return
        startRectRef.current = { x: elm.x, y: elm.y, w: elm.w, h: elm.h }
        setDragDraft({ id: data.id, rect: { x: elm.x, y: elm.y, w: elm.w, h: elm.h } })
        snapPointsRef.current = collectSnapPoints(
          useBuilderStore.getState().elements,
          data.id,
        )
      }
    },
    [setDragDraft],
  )

  const onDragMove = React.useCallback(
    (e: DragMoveEvent) => {
      const data: any = e.active?.data?.current
      if (!data) return
      if (data.from === 'canvas' && startRectRef.current && snapPointsRef.current) {
        const s = startRectRef.current
        const candidate = { x: s.x + e.delta.x, y: s.y + e.delta.y, w: s.w, h: s.h }
        const { rect, guides } = snapRect(candidate, snapPointsRef.current, {
          mode: 'move',
        })
        setDragDraft({ id: data.id, rect })
        setGuides(guides)
      }
    },
    [setDragDraft, setGuides],
  )

  const onDragEnd = React.useCallback(
    (e: DragEndEvent) => {
      const data: any = e.active?.data?.current
      if (!data) return
      const overId = e.over?.id

      if (data.from === 'palette') {
        if (overId !== 'CANVAS') return
        const evt = (e.activatorEvent || e.activator || {}) as any
        const clientX =
          evt?.clientX ??
          (evt?.touches && evt.touches[0]?.clientX) ??
          (evt?.changedTouches && evt.changedTouches[0]?.clientX)
        const clientY =
          evt?.clientY ??
          (evt?.touches && evt.touches[0]?.clientY) ??
          (evt?.changedTouches && evt.changedTouches[0]?.clientY)
        const rect = canvasRef.current?.getBoundingClientRect()
        const x = rect ? clientX - rect.left : 40
        const y = rect ? clientY - rect.top : 40
        if (data.type === 'code') {
          addFromPalette('code', { x, y }, data.meta)
        } else {
          addFromPalette(data.type as any, { x, y })
        }
      } else if (data.from === 'canvas' && typeof data.id === 'string') {
        if (overId === 'CANVAS') {
          const draft = useBuilderStore.getState().ui.dragDraft
          if (draft && draft.id === data.id) {
            moveExisting(data.id, { x: draft.rect.x, y: draft.rect.y }, false)
          }
        }
      }
      setDragDraft(undefined)
      clearGuides()
      startRectRef.current = null
      snapPointsRef.current = null
    },
    [addFromPalette, moveExisting, setDragDraft, clearGuides],
  )

  const onExport = React.useCallback(() => {
    const codeEls = elements.filter((e) => e.type === 'code' && e.code) as Elm[]
    const imports = new Map<string, { name: string; path: string; exp?: string }>()
    codeEls.forEach((e) => {
      const key = `${e.code!.importPath}::${e.code!.exportName || 'default'}`
      if (!imports.has(key)) {
        imports.set(key, {
          name: e.code!.displayName,
          path: e.code!.importPath,
          exp: e.code!.exportName,
        })
      }
    })
    const importLines = Array.from(imports.values()).map((m) =>
      m.exp
        ? `import { ${m.exp} as ${m.name} } from "${m.path}"`
        : `import ${m.name} from "${m.path}"`,
    )
    const body = codeEls
      .map((e) => {
        const name = e.code!.displayName
        const propsStr = Object.entries(e.code!.props || {})
          .map(([k, v]) =>
            typeof v === 'string'
              ? `${k}=${JSON.stringify(v)}`
              : `${k}={${JSON.stringify(v)}}`,
          )
          .join(' ')
        return `      <div style={{ position: 'absolute', left: ${e.x}, top: ${e.y}, width: ${e.w}, height: ${e.h} }}>` +
          `\n        <${name}${propsStr ? ' ' + propsStr : ''} />\n      </div>`
      })
      .join('\n')
    const content =
      `import React from 'react'\n${importLines.join('\n')}\n\nexport default function Composer() {\n` +
      `  return (\n    <div style={{ position: 'relative', width: 1200, height: 720 }}>\n${body}\n    </div>\n  )\n}\n`
    const blob = new Blob([content], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'Composer.tsx'
    a.click()
    URL.revokeObjectURL(a.href)
  }, [elements])

  React.useEffect(() => {
    setElements(getTree())
  }, [currentPageId, getTree, setElements])

  React.useEffect(() => {
    setTree(elements)
  }, [elements, setTree])

  return (
    <div className="flex h-[calc(100vh-40px)]">
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
      >
        <aside className="w-48 border-r border-zinc-800 bg-zinc-950/40 p-3">
          <PagesPanel />
        </aside>
        <aside className="w-64 border-r border-zinc-800 bg-zinc-950/40 p-3">
          <h2 className="text-sm font-semibold mb-2">パレット</h2>
          <Palette />
        </aside>
        <main className="flex-1 relative">
          <Canvas canvasRef={canvasRef} />
        </main>
        <aside className="w-72 border-l border-zinc-800 bg-zinc-950/40 p-3 flex flex-col">
          <h2 className="text-sm font-semibold mb-2">プロパティ</h2>
          <Inspector />
          <button
            className="mt-auto px-2 py-1 text-xs rounded bg-zinc-800 border border-zinc-700 hover:bg-zinc-700"
            onClick={onExport}
          >
            Export Composer
          </button>
        </aside>
      </DndContext>
    </div>
  )
}

