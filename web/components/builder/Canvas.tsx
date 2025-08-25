'use client'
import React from 'react'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { useBuilderStore, type Elm } from '@/store/builderStore'

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

type LoginButton = NonNullable<Elm['props']>['loginButton']

function HeaderLoginButton({ data }: { data: LoginButton }) {
  const Tag: any = data.href ? 'a' : 'button'
  const base = [
    'absolute right-3 top-1/2 -translate-y-1/2',
    'min-w-[88px] h-8 px-3 rounded-lg flex items-center justify-center',
    'text-[12px] z-10 cursor-pointer',
  ].join(' ')
  const variant =
    data.variant === 'outline'
      ? 'bg-transparent border border-[#94a3b8] text-[#e5e7eb] hover:bg-white/10'
      : 'bg-[#0ea5e9] text-[#0b1220] hover:bg-[#0ea5e9]/90'
  const tagProps = data.href ? { href: data.href } : {}
  return (
    <Tag
      {...tagProps}
      className={`${base} ${variant}`}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {data.label}
    </Tag>
  )
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

function ElmView({ elm }: { elm: Elm }) {
  const select = useBuilderStore((s) => s.select)
  const selectedId = useBuilderStore((s) => s.selectedId)
  const isSel = selectedId === elm.id
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `elm_${elm.id}`,
    data: { from: 'canvas', id: elm.id, anchorX: elm.w / 2, anchorY: elm.h / 2 },
  })

  const common = 'absolute rounded border text-[12px] select-none'
  const border = isSel ? 'border-amber-400' : 'border-zinc-700'
  const shadow = isSel ? 'shadow-[0_0_0_1px_rgba(251,191,36,0.6)]' : ''

  const baseStyle: React.CSSProperties = {
    left: elm.x,
    top: elm.y,
    width: elm.w,
    height: elm.h,
    background: elm.props?.bg,
    color: elm.props?.color ?? '#e5e7eb',
    opacity: elm.visible === false ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onMouseDown={() => select(elm.id)}
      className={`${common} ${border} ${shadow} cursor-move ${isDragging ? 'opacity-60' : ''}`}
      style={baseStyle}
    >
      {elm.type === 'header' && (
        <>
          <div className="h-full flex items-center px-3">Header</div>
          {elm.props?.loginButton?.enabled && (
            <HeaderLoginButton data={elm.props.loginButton} />
          )}
        </>
      )}
      {elm.type === 'footer' && <div className="h-full flex items-center justify-center px-3">Footer</div>}
      {elm.type === 'sidebar' && <div className="h-full flex items-start px-3 py-2">Sidebar</div>}
      {elm.type === 'hud' && <div className="h-full flex items-center justify-center px-3">HUD</div>}
      {elm.type === 'container' && <div className="h-full px-3 py-2">Container</div>}
      {elm.type === 'button' && (
        <div className="h-full flex items-center justify-center font-medium">{elm.props?.text ?? 'Button'}</div>
      )}
      {elm.type === 'text' && <div className="h-full flex items-center px-2">{elm.props?.text ?? 'Text'}</div>}
      {elm.type === 'code' && <CodePreview elm={elm} />}
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
        <div className="absolute left-2 bottom-2 text-[11px] text-zinc-400 bg-black/40 px-2 py-1 rounded border border-zinc-800">
          drag to move • drop from Palette • arrows to nudge • click empty = unselect
        </div>
      </div>
    </div>
  )
}

