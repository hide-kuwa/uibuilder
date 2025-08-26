'use client'
import React from 'react'
import { useBuilderStore, type Elm } from '@/store/builderStore'

type NavItem = { id: string; label: string; href?: string; active?: boolean }

export function HeaderInspector({ elm }: { elm: Elm }) {
  const updateProps = useBuilderStore((s) => s.updateProps)
  const navItems: NavItem[] | undefined = (elm.props as any)?.navItems
  const setNavItems = (items: NavItem[]) =>
    updateProps(elm.id, { navItems: items } as any)
  const addItem = () =>
    setNavItems([...(navItems ?? []), { id: `nav_${Date.now().toString(36)}`, label: 'Item' }])
  const updateItem = (idx: number, patch: Partial<NavItem>) => {
    const next = [...(navItems ?? [])]
    next[idx] = { ...next[idx], ...patch }
    setNavItems(next)
  }
  const removeItem = (idx: number) => {
    const next = [...(navItems ?? [])]
    next.splice(idx, 1)
    setNavItems(next)
  }
  const moveItem = (idx: number, dir: -1 | 1) => {
    const next = [...(navItems ?? [])]
    const [it] = next.splice(idx, 1)
    next.splice(idx + dir, 0, it)
    setNavItems(next)
  }
  return (
    <>
      <div className="text-sm font-medium">Navigation</div>
      <div className="space-y-2 text-xs">
        {navItems?.map((item, i) => (
          <div key={item.id} className="border border-zinc-800 rounded p-2 space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-medium">Item {i + 1}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => moveItem(i, -1)}
                  disabled={i === 0}
                  className="px-1 rounded bg-zinc-900 border border-zinc-800 disabled:opacity-50"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveItem(i, 1)}
                  disabled={i === (navItems?.length ?? 0) - 1}
                  className="px-1 rounded bg-zinc-900 border border-zinc-800 disabled:opacity-50"
                >
                  ↓
                </button>
                <button
                  onClick={() => removeItem(i)}
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
                value={item.label}
                onChange={(e) => updateItem(i, { label: e.target.value })}
                type="text"
              />
            </label>
            <label className="flex flex-col gap-1">
              Link
              <input
                className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
                value={item.href ?? ''}
                onChange={(e) =>
                  updateItem(i, { href: e.target.value || undefined })
                }
                type="text"
                placeholder="/path"
              />
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.active ?? false}
                onChange={(e) => updateItem(i, { active: e.target.checked })}
              />
              Active
            </label>
          </div>
        ))}
        <button
          className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
          onClick={addItem}
        >
          Add item
        </button>
      </div>
      <div className="text-sm font-medium">Login Button</div>
      <div className="space-y-2 text-xs">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={elm.props?.loginButton?.enabled ?? false}
            onChange={(e) => {
              if (e.target.checked) {
                const cur = elm.props?.loginButton
                updateProps(elm.id, {
                  loginButton: {
                    enabled: true,
                    label: cur?.label ?? 'Log in',
                    variant: cur?.variant ?? 'solid',
                    href: cur?.href,
                  },
                })
              } else {
                updateProps(elm.id, {
                  loginButton: { ...(elm.props?.loginButton ?? {}), enabled: false },
                })
              }
            }}
          />
          Enable
        </label>
        {elm.props?.loginButton?.enabled && (
          <>
            <label className="flex flex-col gap-1">
              Label
              <input
                className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
                value={elm.props?.loginButton?.label ?? ''}
                onChange={(e) =>
                  updateProps(elm.id, {
                    loginButton: {
                      ...(elm.props?.loginButton ?? {}),
                      label: e.target.value,
                    },
                  })
                }
                type="text"
              />
            </label>
            <label className="flex flex-col gap-1">
              Variant
              <select
                className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
                value={elm.props?.loginButton?.variant ?? 'solid'}
                onChange={(e) =>
                  updateProps(elm.id, {
                    loginButton: {
                      ...(elm.props?.loginButton ?? {}),
                      variant: e.target.value as 'solid' | 'outline',
                    },
                  })
                }
              >
                <option value="solid">solid</option>
                <option value="outline">outline</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              Link
              <input
                className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
                value={elm.props?.loginButton?.href ?? ''}
                onChange={(e) =>
                  updateProps(elm.id, {
                    loginButton: {
                      ...(elm.props?.loginButton ?? {}),
                      href: e.target.value || undefined,
                    },
                  })
                }
                type="text"
                placeholder="/login"
              />
            </label>
          </>
        )}
      </div>
    </>
  )
}

