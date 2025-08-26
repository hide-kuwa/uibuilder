'use client'
import React from 'react'
import { useBuilderStore, type Elm } from '@/store/builderStore'

export function HeaderInspector({ elm }: { elm: Elm }) {
  const updateProps = useBuilderStore((s) => s.updateProps)
  const props = elm.props as any
  return (
    <>
      <div className="text-sm font-medium">Sign Up Button</div>
      <div className="space-y-2 text-xs">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={props?.cta?.enabled ?? false}
            onChange={(e) => {
              if (e.target.checked) {
                const cur = props?.cta
                updateProps(
                  elm.id,
                  {
                    cta: {
                      enabled: true,
                      label: cur?.label ?? 'Sign up',
                      variant: cur?.variant ?? 'solid',
                      href: cur?.href,
                    },
                  } as any,
                )
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
                  updateProps(
                    elm.id,
                    {
                      cta: { ...(props?.cta ?? {}), label: e.target.value },
                    } as any,
                  )
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
                  updateProps(
                    elm.id,
                    {
                      cta: {
                        ...(props?.cta ?? {}),
                        variant: e.target.value as 'solid' | 'outline',
                      },
                    } as any,
                  )
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
                  updateProps(
                    elm.id,
                    {
                      cta: {
                        ...(props?.cta ?? {}),
                        href: e.target.value || undefined,
                      },
                    } as any,
                  )
                }
                type="text"
                placeholder="/signup"
              />
            </label>
          </>
        )}
      </div>

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

