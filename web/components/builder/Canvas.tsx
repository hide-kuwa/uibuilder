'use client'
import React from 'react'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { useBuilderStore, type Elm } from '@/store/builderStore'
import { collectSnapPoints, snapRect } from '@/lib/builder/snap'
import { CanvasOverlay } from './CanvasOverlay'
import { HeaderView } from './header/HeaderView'
import { FooterView } from './footer/FooterView'
import { SidebarView } from '@/components/app/SidebarView'
import PresetStyle from '@/components/interaction/PresetStyle'

const GRID = 8
function bgGridStyle() {
  const s = GRID
  return {
    backgroundImage:
      'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
    backgroundSize: `${s}px ${s}px, ${s}px ${s}px`,
    backgroundPosition: '0 0, 0 0',
  } as React.CSSProperties
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch() {}
  render() {
    if (this.state.hasError) {
      return <div className="text-[11px] text-red-400">failed to load</div>
    }
    return this.props.children
  }
}

function CodePreview({ elm }: { elm: Elm }) {
  const Comp = React.useMemo(() => {
    if (!elm.code?.importPath) return null
    return React.lazy(async () => {
      try {
        const mod: any = await import(/* @vite-ignore */ elm.code.importPath)
        return {
          default: elm.code.exportName ? mod[elm.code.exportName] : mod.default,
        }
      } catch {
        return {
          default: () => (
            <div className="text-[11px] text-red-400">load error</div>
          ),
        }
      }
    })
  }, [elm.code?.importPath, elm.code?.exportName])
  if (!Comp) {
    return <div className="text-[11px] text-zinc-400">no component</div>
  }
  return (
    <ErrorBoundary>
      <React.Suspense
        fallback={<div className="text-[11px] text-zinc-400">loading...</div>}
      >
        <div className="w-full h-full pointer-events-none">
          <Comp {...(elm.code?.props ?? {})} />
        </div>
      </React.Suspense>
    </ErrorBoundary>
  )
}

type HandleDir = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'

function ResizeHandles({ elm }: { elm: Elm }) {
  const move = useBuilderStore((s) => s.move)
  const resize = useBuilderStore((s) => s.resize)
  const setDragDraft = useBuilderStore((s) => s.setDragDraft)
  const setGuides = useBuilderStore((s) => s.setGuides)
  const clearGuides = useBuilderStore((s) => s.clearGuides)
  const [resizing, setResizing] = React.useState(false)
  const startRef = React.useRef({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    startX: 0,
    startY: 0,
    aspect: 1,
    dir: 'e' as HandleDir,
  })
  const snapPointsRef = React.useRef<ReturnType<typeof collectSnapPoints> | null>(null)

  const cursors: Record<HandleDir, string> = {
    n: 'ns-resize',
    ne: 'nesw-resize',
    e: 'ew-resize',
    se: 'nwse-resize',
    s: 'ns-resize',
    sw: 'nesw-resize',
    w: 'ew-resize',
    nw: 'nwse-resize',
  }

  const onPointerDown = (dir: HandleDir) => (e: React.PointerEvent) => {
    e.stopPropagation()
    e.preventDefault()
    startRef.current = {
      x: elm.x,
      y: elm.y,
      w: elm.w,
      h: elm.h,
      startX: e.clientX,
      startY: e.clientY,
      aspect: elm.w / elm.h,
      dir,
    }
    setResizing(true)
    document.body.style.cursor = cursors[dir]
    setDragDraft({ id: elm.id, rect: { x: elm.x, y: elm.y, w: elm.w, h: elm.h } })
    setGuides([])
    snapPointsRef.current = collectSnapPoints(
      useBuilderStore.getState().elements,
      elm.id,
    )

    const onMove = (ev: PointerEvent) => {
      const s = startRef.current
      let dx = ev.clientX - s.startX
      let dy = ev.clientY - s.startY

      let w = s.w
      let h = s.h
      if (dir.includes('e')) w = s.w + dx
      if (dir.includes('s')) h = s.h + dy
      if (dir.includes('w')) w = s.w - dx
      if (dir.includes('n')) h = s.h - dy

      if (ev.shiftKey) {
        const ratio = s.w / s.h
        if (dir === 'e' || dir === 'w') {
          h = w / ratio
        } else if (dir === 'n' || dir === 's') {
          w = h * ratio
        } else {
          if (Math.abs(dx) > Math.abs(dy)) {
            h = w / ratio
          } else {
            w = h * ratio
          }
        }
      }

      w = Math.max(16, w)
      h = Math.max(16, h)

      let x = s.x
      let y = s.y
      if (dir.includes('w')) x = s.x + s.w - w
      if (dir.includes('n')) y = s.y + s.h - h
      if (ev.altKey) {
        if (dir.includes('e') || dir.includes('w')) {
          x = s.x + (s.w - w) / 2
        }
        if (dir.includes('n') || dir.includes('s')) {
          y = s.y + (s.h - h) / 2
        }
      }

      const { rect, guides } = snapRect(
        { x, y, w, h },
        snapPointsRef.current!,
        {
        mode: 'resize',
        },
      )
      setDragDraft({ id: elm.id, rect })
      setGuides(guides)
    }

    const onUp = () => {
      const draft = useBuilderStore.getState().ui.dragDraft
      const r = draft?.rect || { x: elm.x, y: elm.y, w: elm.w, h: elm.h }
      move(elm.id, { x: r.x, y: r.y }, false)
      resize(elm.id, { w: r.w, h: r.h }, false)
      setDragDraft(undefined)
      clearGuides()
      setResizing(false)
      document.body.style.cursor = ''
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const pos: Record<HandleDir, string> = {
    n: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
    ne: 'top-0 right-0 translate-x-1/2 -translate-y-1/2',
    e: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2',
    se: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
    s: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
    sw: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
    w: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2',
    nw: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
  }

  const dirs: HandleDir[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {resizing && (
        <div className="absolute inset-0 border border-amber-200 pointer-events-none" />
      )}
      {dirs.map((d) => (
        <div
          key={d}
          onPointerDown={onPointerDown(d)}
          className={`absolute w-2 h-2 bg-amber-400 border border-black rounded-sm pointer-events-auto ${pos[d]} cursor-${cursors[d]}`}
        />
      ))}
    </div>
  )
}

function ElmView({ elm }: { elm: Elm }) {
  const select = useBuilderStore((s) => s.select)
  const selectedId = useBuilderStore((s) => s.selectedId)
  const isSel = selectedId === elm.id
  const dragDraft = useBuilderStore((s) => s.ui.dragDraft)
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `elm_${elm.id}`,
    data: { from: 'canvas', id: elm.id, anchorX: elm.w / 2, anchorY: elm.h / 2 },
  })

  const common = 'absolute rounded border text-[12px] select-none'
  const border = isSel ? 'border-amber-400' : 'border-zinc-700'
  const shadow = isSel ? 'shadow-[0_0_0_1px_rgba(251,191,36,0.6)]' : ''

  const preview = dragDraft && dragDraft.id === elm.id ? dragDraft.rect : null
  const baseStyle: React.CSSProperties = {
    left: elm.x,
    top: elm.y,
    width: preview ? preview.w : elm.w,
    height: preview ? preview.h : elm.h,
    background: elm.props?.bg,
    color: elm.props?.color ?? '#e5e7eb',
    opacity: elm.visible === false ? 0.4 : 1,
    transform: preview
      ? `translate3d(${preview.x - elm.x}px, ${preview.y - elm.y}px, 0)`
      : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onMouseDown={() => select(elm.id)}
      className={`${common} ${border} ${shadow} cursor-move ${isDragging ? 'opacity-60' : ''}`}
      style={baseStyle}
      data-node-id={elm.id}
      data-node-type={elm.type}
      data-node-name={elm.props?.name}
    >
      {elm.type === 'header' && <HeaderView elm={elm} />}
      {elm.type === 'footer' && <FooterView elm={elm} />}
      {elm.type === 'sidebar' && <SidebarView elm={elm} />}
      {elm.type === 'hud' && <div className="h-full flex items-center justify-center px-3">HUD</div>}
      {elm.type === 'container' && <div className="h-full px-3 py-2">Container</div>}
      {elm.type === 'button' && (
        <div className="h-full flex items-center justify-center font-medium">{elm.props?.text ?? 'Button'}</div>
      )}
      {elm.type === 'text' && <div className="h-full flex items-center px-2">{elm.props?.text ?? 'Text'}</div>}
      {elm.type === 'code' && <CodePreview elm={elm} />}
      <PresetStyle nodeId={elm.id} />
      {isSel && <ResizeHandles elm={elm} />}
    </div>
  )
}


export function Canvas({ canvasRef }: { canvasRef: React.RefObject<HTMLDivElement> }) {
  const els = useBuilderStore((s) => s.elements)
  const select = useBuilderStore((s) => s.select)
  const nudge = useBuilderStore((s) => s.nudge)
  const { setNodeRef } = useDroppable({ id: 'CANVAS' })

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Delete', 'Backspace'].includes(e.key)) {
        e.preventDefault()
      }
      if (e.key === 'ArrowUp') nudge(0, -GRID)
      if (e.key === 'ArrowDown') nudge(0, GRID)
      if (e.key === 'ArrowLeft') nudge(-GRID, 0)
      if (e.key === 'ArrowRight') nudge(GRID, 0)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [nudge])

  return (
    <div className="h-full w-full flex items-center justify-center bg-black">
      <div
        ref={(n) => {
          setNodeRef(n)
          // allow external reference
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          canvasRef.current = n
        }}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) select(null)
        }}
        className="relative w-[1200px] h-[720px] border border-zinc-800 rounded-lg overflow-hidden"
        style={bgGridStyle()}
      >
        {/* page base pseudo preview */}
        <div className="absolute inset-0 pointer-events-none" />
        {els.map((e) => (
          <ElmView key={e.id} elm={e} />
        ))}
        <CanvasOverlay />
        <div className="absolute left-2 bottom-2 text-[11px] text-zinc-400 bg-black/40 px-2 py-1 rounded border border-zinc-800">
          drag to move • drop from Palette • arrows to nudge • click empty = unselect
        </div>
      </div>
    </div>
  )
}

