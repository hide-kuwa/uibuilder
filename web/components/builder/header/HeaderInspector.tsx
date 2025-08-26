'use client'
import React from 'react'
import { useBuilderStore, type Elm } from '@/store/builderStore'

type NavItem = { id: string; label: string; href?: string; active?: boolean }

export function HeaderInspector({ elm }: { elm: Elm }) {
  const updateProps = useBuilderStore((s) => s.updateProps)

  // ---- Logo ----
  const logo = (elm.props as any)?.logo as
    | {
        kind: 'text' | 'image'
        text?: string
        src?: string
        w?: number
        h?: number
      }
    | undefined

  // ---- Navigation ----
  const navItems: NavItem[] | undefined = (elm.props as any)?.navItems
  const setNavItems = (items: NavItem[]) =>
    updateProps(elm.id, { navItems: items } as any)

  const addItem = () =>
    setNavItems([
      ...(navItems ?? []),
      { id: `nav_${Date.now().toString(36)}`, label: 'Item' },
    ])

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

  // ---- CTA / Login ----
  const props = elm.props as any

  return (
    <>
      {/* Logo */}
      <div className="text-sm font-medium">Logo</div>
      <div className="space-y-2 text-xs mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!logo}
            onChange={(e) => {
              if (e.target.checked) {
                updateProps(elm.id, {
                  logo: { kind: 'text', text: 'Logo' },
                } as any)
              } else {
                updateProps(elm.id, { logo: undefined } as any)
              }
            }}
          />
          Enable
        </label>
        {logo && (
          <>
            <label className="flex flex-col gap-1">
              Kind
              <select
                className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
                value={logo.kind}
                onChange={(e) =>
                  updateProps(elm.id, {
                    logo: {
                      ...(logo ?? {}),
                      kind: e.target.value as 'text' | 'image',
                    },
                  } as any)
                }
              >
                <option value="text">text</option>
                <option value="image">image</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              Text
              <input
                className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
                value={logo.text ?? ''}
                onChange={(e) =>
                  updateProps(elm.id, {
                    logo: { ...(logo ?? {}), text: e.target.value },
                  } as any)
                }
                type="text"
              />
            </label>
            {logo.kind === 'image' && (
              <>
                <label className="flex flex-col gap-1">
                  Src
                  <input
                    className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
                    value={logo.src ?? ''}
                    onChange={(e) =>
                      updateProps(elm.id, {
                        logo: { ...(logo ?? {}), src: e.target.value },
                      } as any)
                    }
                    type="text"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Width
                  <input
                    className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
                    value={logo.w ?? ''}
                    onChange={(e) =>
                      updateProps(elm.id, {
                        logo: {
                          ...(logo ?? {}),
                          w: e.target.value ? Number(e.target.value) : undefined,
                        },
                      } as any)
                    }
                    type="number"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Height
                  <input
                    className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
                    value={logo.h ?? ''}
                    onChange={(e) =>
                      updateProps(elm.id, {
                        logo: {
                          ...(logo ?? {}),
                          h: e.target.value ? Number(e.target.value) : undefined,
                        },
                      } as any)
                    }
                    type="number"
                  />
                </label>
              </>
            )}
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="text-sm font-medium">Navigation</div>
      <div className="space-y-2 text-xs">
        {navItems?.map((item, i) => (
          <div
            key={item.id}
            className="border border-zinc-800 rounded p-2 space-y-1"
          >
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

      {/* CTA: Sign up */}
      <div className="text-sm font-medium mt-4">Sign Up Button</div>
      <div className="space-y-2 text-xs">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={props?.cta?.enabled ?? false}
            onChange={(e) => {
              if (e.target.checked) {
                const cur = props?.cta
                updateProps(elm.id, {
                  cta: {
                    enabled: true,
                    label: cur?.label ?? 'Sign up',
                    variant: cur?.variant ?? 'solid',
                    href: cur?.href,
                  },
                } as any)
              } else {
                updateProps(
                  elm.id,
                  { cta: { ...(props?.cta ?? {}), enabled: false } } as any,
                )
              }
            }}
          />
          Enable
        </label>
        {props?.cta?.enabled && (
          <>
            <label className="flex flex-col gap-1">
              Label
              <input
                className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
                value={props?.cta?.label ?? ''}
                onChange={(e) =>
                  updateProps(elm.id, {
                    cta: { ...(props?.cta ?? {}), label: e.target.value },
                  } as any)
                }
                type="text"
              />
            </label>

            <label className="flex flex-col gap-1">
              Variant
              <select
                className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
                value={props?.cta?.variant ?? 'solid'}
                onChange={(e) =>
                  updateProps(elm.id, {
                    cta: {
                      ...(props?.cta ?? {}),
                      variant: e.target.value as 'solid' | 'outline',
                    },
                  } as any)
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
                value={props?.cta?.href ?? ''}
                onChange={(e) =>
                  updateProps(elm.id, {
                    cta: {
                      ...(props?.cta ?? {}),
                      href: e.target.value || undefined,
                    },
                  } as any)
                }
                type="text"
                placeholder="/signup"
              />
            </label>
          </>
        )}
      </div>

      {/* Login */}
      <div className="text-sm font-medium mt-4">Login Button</div>
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
                  loginButton: {
                    ...(elm.props?.loginButton ?? {}),
                    enabled: false,
                  },
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
