'use client'
import React from 'react'
import { useBuilderStore, type Elm } from '@/store/builderStore'

type LinkItem = { id: string; label: string; href?: string }
type SocialKind = 'x' | 'github' | 'linkedin' | 'facebook' | 'instagram' | 'youtube'
type SocialItem = { id: string; kind: SocialKind; href?: string }

export function FooterInspector({ elm }: { elm: Elm }) {
  const updateProps = useBuilderStore((s) => s.updateProps)
  const props = (elm.props as any) ?? {}

  // --- コピーライト ---
  const text: string = props?.text ?? ''

  // --- リンク ---
  const links: LinkItem[] = props?.links ?? []
  const setLinks = (items: LinkItem[]) => updateProps(elm.id, { links: items } as any)
  const addLink = () =>
    setLinks([...(links ?? []), { id: `link_${Date.now().toString(36)}`, label: 'Link' }])
  const updLink = (i: number, patch: Partial<LinkItem>) => {
    const next = [...links]
    next[i] = { ...next[i], ...patch }
    setLinks(next)
  }
  const delLink = (i: number) => {
    const next = [...links]
    next.splice(i, 1)
    setLinks(next)
  }
  const mvLink = (i: number, dir: -1 | 1) => {
    const next = [...links]
    const [it] = next.splice(i, 1)
    next.splice(i + dir, 0, it)
    setLinks(next)
  }

  // --- ソーシャル ---
  const socials: SocialItem[] = props?.socials ?? []
  const setSocials = (items: SocialItem[]) => updateProps(elm.id, { socials: items } as any)
  const addSocial = () =>
    setSocials([
      ...(socials ?? []),
      { id: `soc_${Date.now().toString(36)}`, kind: 'x' as SocialKind },
    ])
  const updSocial = (i: number, patch: Partial<SocialItem>) => {
    const next = [...socials]
    next[i] = { ...next[i], ...patch }
    setSocials(next)
  }
  const delSocial = (i: number) => {
    const next = [...socials]
    next.splice(i, 1)
    setSocials(next)
  }
  const mvSocial = (i: number, dir: -1 | 1) => {
    const next = [...socials]
    const [it] = next.splice(i, 1)
    next.splice(i + dir, 0, it)
    setSocials(next)
  }

  return (
    <div className="space-y-4">
      {/* コピーライト */}
      <div>
        <div className="text-sm font-medium">Copyright</div>
        <div className="mt-2 text-xs space-y-2">
          <label className="flex flex-col gap-1">
            Text
            <input
              className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
              value={text}
              onChange={(e) => updateProps(elm.id, { text: e.target.value } as any)}
              type="text"
              placeholder={`© ${new Date().getFullYear()} MyApp`}
            />
          </label>
        </div>
      </div>

      {/* リンク */}
      <div>
        <div className="text-sm font-medium">Links</div>
        <div className="mt-2 text-xs space-y-2">
          {links.map((item, i) => (
            <div key={item.id} className="border border-zinc-800 rounded p-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Item {i + 1}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => mvLink(i, -1)}
                    disabled={i === 0}
                    className="px-1 rounded bg-zinc-900 border border-zinc-800 disabled:opacity-50"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => mvLink(i, 1)}
                    disabled={i === links.length - 1}
                    className="px-1 rounded bg-zinc-900 border border-zinc-800 disabled:opacity-50"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => delLink(i)}
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
                  onChange={(e) => updLink(i, { label: e.target.value })}
                  type="text"
                />
              </label>

              <label className="flex flex-col gap-1">
                Link
                <input
                  className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
                  value={item.href ?? ''}
                  onChange={(e) => updLink(i, { href: e.target.value || undefined })}
                  type="text"
                  placeholder="/about"
                />
              </label>
            </div>
          ))}

          <button
            onClick={addLink}
            className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
          >
            Add link
          </button>
        </div>
      </div>

      {/* ソーシャル */}
      <div>
        <div className="text-sm font-medium">Socials</div>
        <div className="mt-2 text-xs space-y-2">
          {socials.map((item, i) => (
            <div key={item.id} className="border border-zinc-800 rounded p-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Item {i + 1}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => mvSocial(i, -1)}
                    disabled={i === 0}
                    className="px-1 rounded bg-zinc-900 border border-zinc-800 disabled:opacity-50"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => mvSocial(i, 1)}
                    disabled={i === socials.length - 1}
                    className="px-1 rounded bg-zinc-900 border border-zinc-800 disabled:opacity-50"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => delSocial(i)}
                    className="px-1 rounded bg-zinc-900 border border-zinc-800"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <label className="flex flex-col gap-1">
                Kind
                <select
                  className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
                  value={item.kind}
                  onChange={(e) => updSocial(i, { kind: e.target.value as SocialKind })}
                >
                  <option value="x">X</option>
                  <option value="github">GitHub</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                </select>
              </label>

              <label className="flex flex-col gap-1">
                Link
                <input
                  className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
                  value={item.href ?? ''}
                  onChange={(e) => updSocial(i, { href: e.target.value || undefined })}
                  type="text"
                  placeholder="https://..."
                />
              </label>
            </div>
          ))}

          <button
            onClick={addSocial}
            className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
          >
            Add social
          </button>
        </div>
      </div>
    </div>
  )
}

