'use client'
import React from 'react'
import type { Elm } from '@/store/builderStore'

type MenuItem = {
  id: string
  label: string
  href?: string
  icon?: string // 省略可：先頭文字を丸で表示
  active?: boolean
  children?: MenuItem[]
}

type SidebarProps = {
  position?: 'left' | 'right'
  width?: number // px
  collapsible?: boolean
  collapsed?: boolean
  sectionTitle?: string
  items?: MenuItem[]
}

function Row({
  item,
  depth,
}: {
  item: MenuItem
  depth: number
}) {
  const [open, setOpen] = React.useState(true)
  const hasChildren = !!item.children?.length
  const pad = 8 + depth * 12

  return (
    <div className="select-none">
      <div
        className={[
          'flex items-center h-8 rounded-md px-2 text-sm',
          item.active ? 'bg-white/10 text-white' : 'text-[#e5e7eb] hover:bg-white/5',
        ].join(' ')}
        style={{ paddingLeft: pad }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {hasChildren && (
          <button
            className="mr-1 h-5 w-5 rounded border border-[#334155] text-[10px] flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation()
              setOpen((v) => !v)
            }}
          >
            {open ? '−' : '+'}
          </button>
        )}
        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded bg-white/10 text-[11px]">
          {item.icon ? item.icon : item.label.slice(0, 1).toUpperCase()}
        </span>
        {item.href ? (
          <a href={item.href} className="truncate" onClick={(e) => e.preventDefault()}>
            {item.label}
          </a>
        ) : (
          <span className="truncate">{item.label}</span>
        )}
      </div>

      {hasChildren && open && (
        <div className="mt-1">
          {item.children!.map((c) => (
            <Row key={c.id} item={c} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function SidebarView({ elm }: { elm: Elm }) {
  const props = (elm.props as any) as SidebarProps | undefined
  const position = props?.position ?? 'left'
  const w = props?.width ?? 260
  const title = props?.sectionTitle ?? 'Navigation'
  const collapsed = !!props?.collapsed
  const items: MenuItem[] = props?.items ?? []

  return (
    <aside
      className={[
        'h-full w-full bg-[#0b1220] text-white relative',
        position === 'left' ? 'border-r border-[#1f2937]' : 'border-l border-[#1f2937]',
      ].join(' ')}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="h-10 flex items-center px-3 text-xs tracking-wide uppercase text-[#94a3b8]">
        {title}
      </div>

      {/* 本体 */}
      {!collapsed ? (
        <div className="px-2 pb-2 space-y-1 overflow-auto">
          {items.map((it) => (
            <Row key={it.id} item={it} depth={0} />
          ))}
          {!items.length && (
            <div className="text-xs text-[#94a3b8] px-2 py-6">
              Add items in the Inspector →
            </div>
          )}
        </div>
      ) : (
        <div className="px-2 pb-2 space-y-1 overflow-auto">
          {items.map((it) => (
            <div
              key={it.id}
              className={[
                'h-8 w-8 rounded-md mx-1',
                it.active ? 'bg-white/10' : 'bg-white/5',
                'flex items-center justify-center text-[11px]',
              ].join(' ')}
              title={it.label}
            >
              {it.icon ? it.icon : it.label.slice(0, 1).toUpperCase()}
            </div>
          ))}
        </div>
      )}

      {/* 幅のヒント（Canvas上の見た目調整用） */}
      <div
        className="pointer-events-none absolute inset-y-0"
        style={{
          [position]: 0,
          width: w,
          outline: '1px dashed rgba(148,163,184,0.25)',
        } as React.CSSProperties}
      />
    </aside>
  )
}

