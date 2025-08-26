'use client'
import React from 'react'
import { useBuilderStore, type Elm } from '@/store/builderStore'

export function HeaderInspector({ elm }: { elm: Elm }) {
  const updateProps = useBuilderStore((s) => s.updateProps)
  const search = (elm.props as any)?.search as
    | { enabled: boolean; placeholder?: string; width?: number }
    | undefined
  return (
    <>
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

      <div className="mt-4 text-sm font-medium">Search</div>
      <div className="space-y-2 text-xs">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={search?.enabled ?? false}
            onChange={(e) => {
              if (e.target.checked) {
                const cur = search
                updateProps(elm.id, {
                  search: {
                    enabled: true,
                    placeholder: cur?.placeholder,
                    width: cur?.width,
                  },
                } as any)
              } else {
                updateProps(elm.id, { search: { ...(search ?? {}), enabled: false } } as any)
              }
            }}
          />
          Enable
        </label>
        {search?.enabled && (
          <>
            <label className="flex flex-col gap-1">
              Placeholder
              <input
                className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
                value={search?.placeholder ?? ''}
                onChange={(e) =>
                  updateProps(elm.id, {
                    search: { ...(search ?? {}), placeholder: e.target.value },
                  } as any)
                }
                type="text"
              />
            </label>
            <label className="flex flex-col gap-1">
              Width
              <input
                className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
                value={search?.width ?? ''}
                onChange={(e) =>
                  updateProps(elm.id, {
                    search: {
                      ...(search ?? {}),
                      width: e.target.value ? Number(e.target.value) : undefined,
                    },
                  } as any)
                }
                type="number"
              />
            </label>
          </>
        )}
      </div>
    </>
  )
}

