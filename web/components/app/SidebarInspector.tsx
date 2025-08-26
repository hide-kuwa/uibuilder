'use client'
import React from 'react'
import { useBuilderStore, type Elm } from '@/store/builderStore'

type MenuItem = {
  id: string
  label: string
  href?: string
  icon?: string
  active?: boolean
  children?: MenuItem[]
}

export function SidebarInspector({ elm }: { elm: Elm }) {
  const updateProps = useBuilderStore((s) => s.updateProps)
  const props = (elm.props as any) ?? {}

  const setProps = (patch: any) => updateProps(elm.id, patch)

  // 位置・幅・折りたたみ
  const position: 'left' | 'right' = props.position ?? 'left'
  const width: number = props.width ?? 260
  const collapsible: boolean = props.collapsible ?? true
  const collapsed: boolean = props.collapsed ?? false
  const sectionTitle: string = props.sectionTitle ?? 'Navigation'

  // メニュー
  const items: MenuItem[] = props.items ?? []

  const setItems = (next: MenuItem[]) => setProps({ items: next })

  const addItem = () =>
    setItems([
      ...items,
      { id: `m_${Date.now().toString(36)}`, label: 'Item', children: [] },
    ])

  const updItem = (idx: number, patch: Partial<MenuItem>) => {
    const next = [...items]
    next[idx] = { ...next[idx], ...patch }
    setItems(next)
  }

  const delItem = (idx: number) => {
    const next = [...items]
    next.splice(idx, 1)
    setItems(next)
  }

  const mvItem = (idx: number, dir: -1 | 1) => {
    const next = [...items]
    const [it] = next.splice(idx, 1)
    next.splice(Math.max(0, Math.min(next.length, idx + dir)), 0, it)
    setItems(next)
  }

  const addChild = (idx: number) => {
    const next = [...items]
    const c = next[idx].children ?? []
    next[idx] = {
      ...next[idx],
      children: [...c, { id: `c_${Date.now().toString(36)}`, label: 'Child' }],
    }
    setItems(next)
  }

  const updChild = (i: number, j: number, patch: Partial<MenuItem>) => {
    const next = [...items]
    const ch = [...(next[i].children ?? [])]
    ch[j] = { ...ch[j], ...patch }
    next[i] = { ...next[i], children: ch }
    setItems(next)
  }

  const delChild = (i: number, j: number) => {
    const next = [...items]
    const ch = [...(next[i].children ?? [])]
    ch.splice(j, 1)
    next[i] = { ...next[i], children: ch }
    setItems(next)
  }

  const mvChild = (i: number, j: number, dir: -1 | 1) => {
    const next = [...items]
    const ch = [...(next[i].children ?? [])]
    const [it] = ch.splice(j, 1)
    ch.splice(Math.max(0, Math.min(ch.length, j + dir)), 0, it)
    next[i] = { ...next[i], children: ch }
    setItems(next)
  }

  return (
    <div className="space-y-4">
      {/* レイアウト */}
      <div>
        <div className="text-sm font-medium">Layout</div>
        <div className="mt-2 text-xs space-y-2">
          <label className="flex flex-col gap-1">
            Title
            <input
              className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
              value={sectionTitle}
              onChange={(e) => setProps({ sectionTitle: e.target.value })}
              type="text"
            />
          </label>

          <label className="flex flex-col gap-1">
            Position
            <select
              className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
              value={position}
              onChange={(e) => setProps({ position: e.target.value as 'left' | 'right' })}
            >
              <option value="left">left</option>
              <option value="right">right</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            Width (px)
            <input
              className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
              value={width}
              onChange={(e) =>
                setProps({ width: e.target.value ? Number(e.target.value) : undefined })
              }
              type="number"
              min={160}
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={collapsible}
              onChange={(e) => setProps({ collapsible: e.target.checked })}
            />
            Collapsible
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={collapsed}
              onChange={(e) => setProps({ collapsed: e.target.checked })}
              disabled={!collapsible}
            />
            Collapsed
          </label>
        </div>
      </div>

      {/* メニュー */}
      <div>
        <div className="text-sm font-medium">Menu Items</div>
        <div className="mt-2 text-xs space-y-2">
          {items.map((it, i) => (
            <div key={it.id} className="border border-zinc-800 rounded p-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Item {i + 1}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => mvItem(i, -1)}
                    disabled={i === 0}
                    className="px-1 rounded bg-zinc-900 border border-zinc-800 disabled:opacity-50"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => mvItem(i, 1)}
                    disabled={i === items.length - 1}
                    className="px-1 rounded bg-zinc-900 border border-zinc-800 disabled:opacity-50"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => delItem(i)}
                    className="px-1 rounded bg-zinc-900 border border-zinc-800"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <label className="flex flex-col gap-1">
                Label
                <input
                  className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
                  value={it.label}
                  onChange={(e) => updItem(i, { label: e.target.value })}
                  type="text"
                />
              </label>

              <label className="flex flex-col gap-1">
                Link
                <input
                  className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
                  value={it.href ?? ''}
                  onChange={(e) => updItem(i, { href: e.target.value || undefined })}
                  type="text"
                  placeholder="/dashboard"
                />
              </label>

              <div className="flex gap-3">
                <label className="flex flex-col gap-1 flex-1">
                  Icon (optional)
                  <input
                    className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
                    value={it.icon ?? ''}
                    onChange={(e) => updItem(i, { icon: e.target.value || undefined })}
                    type="text"
                    placeholder="e.g. 🔧 or 'GH'"
                  />
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={it.active ?? false}
                    onChange={(e) => updItem(i, { active: e.target.checked })}
                  />
                  Active
                </label>
              </div>

              {/* 子要素 */}
              <div className="pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Children</span>
                  <button
                    onClick={() => addChild(i)}
                    className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
                  >
                    Add child
                  </button>
                </div>
                {(it.children ?? []).map((c, j) => (
                  <div key={c.id} className="ml-2 border border-zinc-800 rounded p-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] opacity-80">Child {j + 1}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => mvChild(i, j, -1)}
                          disabled={j === 0}
                          className="px-1 rounded bg-zinc-900 border border-zinc-800 disabled:opacity-50"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => mvChild(i, j, 1)}
                          disabled={j === (it.children?.length ?? 0) - 1}
                          className="px-1 rounded bg-zinc-900 border border-zinc-800 disabled:opacity-50"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => delChild(i, j)}
                          className="px-1 rounded bg-zinc-900 border border-zinc-800"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <label className="flex flex-col gap-1">
                      Label
                      <input
                        className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
                        value={c.label}
                        onChange={(e) => updChild(i, j, { label: e.target.value })}
                        type="text"
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      Link
                      <input
                        className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
                        value={c.href ?? ''}
                        onChange={(e) => updChild(i, j, { href: e.target.value || undefined })}
                        type="text"
                        placeholder="/settings/profile"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={addItem}
            className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
          >
            Add item
          </button>
        </div>
      </div>
    </div>
  )
}

