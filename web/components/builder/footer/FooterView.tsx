'use client'
import React from 'react'
import type { Elm } from '@/store/builderStore'

type LinkItem = { id: string; label: string; href?: string }
type SocialKind = 'x' | 'github' | 'linkedin' | 'facebook' | 'instagram' | 'youtube'
type SocialItem = { id: string; kind: SocialKind; href?: string }

export function FooterView({ elm }: { elm: Elm }) {
  const props = (elm.props as any) ?? {}
  const text: string = props?.text ?? `© ${new Date().getFullYear()} MyApp`
  const links: LinkItem[] = props?.links ?? []
  const socials: SocialItem[] = props?.socials ?? []

  const linkClass =
    'text-[12px] text-[#e5e7eb] hover:underline cursor-pointer select-none'
  const iconBox =
    'h-8 w-8 rounded-lg border border-[#94a3b8] flex items-center justify-center text-[12px] text-[#e5e7eb]'

  const SocialIcon = ({ kind }: { kind: SocialKind }) => {
    const map: Record<SocialKind, React.ReactNode> = {
      x: '𝕏',
      github: 'GH',
      linkedin: 'in',
      facebook: 'f',
      instagram: 'ig',
      youtube: '▶',
    }
    return <span>{map[kind]}</span>
  }

  return (
    <div
      className="relative h-full w-full flex items-center px-3"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* 左: コピーライト */}
      <div className="mr-3 text-[12px] text-[#94a3b8] whitespace-nowrap">
        {text}
      </div>

      {/* 中央: リンク */}
      <div className="flex-1">
        {links.length ? (
          <nav className="flex gap-4">
            {links.map((l) => {
              const Tag: any = l.href ? 'a' : 'span'
              const tagProps = l.href ? { href: l.href } : {}
              return (
                <Tag key={l.id} {...tagProps} className={linkClass}>
                  {l.label}
                </Tag>
              )
            })}
          </nav>
        ) : null}
      </div>

      {/* 右: ソーシャル */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {socials.map((s) => {
          const Tag: any = s.href ? 'a' : 'span'
          const tagProps = s.href ? { href: s.href } : {}
          return (
            <Tag key={s.id} {...tagProps} className={iconBox}>
              <SocialIcon kind={s.kind} />
            </Tag>
          )
        })}
      </div>
    </div>
  )
}

