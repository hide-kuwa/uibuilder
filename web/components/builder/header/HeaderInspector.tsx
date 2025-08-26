'use client'
import React from 'react'
import { useBuilderStore, type Elm } from '@/store/builderStore'

export function HeaderInspector({ elm }: { elm: Elm }) {
  const updateProps = useBuilderStore((s) => s.updateProps)
  const logo = (elm.props as any)?.logo as
    | {
        kind: 'text' | 'image'
        text?: string
        src?: string
        w?: number
        h?: number
      }
    | undefined
  return (
    <>
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
                    logo: { ...(logo ?? {}), kind: e.target.value as 'text' | 'image' },
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

