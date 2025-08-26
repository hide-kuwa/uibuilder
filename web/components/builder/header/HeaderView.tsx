'use client'
import React from 'react'
import type { Elm } from '@/store/builderStore'

type NavItem = { id: string; label: string; href?: string; active?: boolean }
type ButtonProps = NonNullable<Elm['props']>['loginButton']
type Logo = {
  kind: 'text' | 'image'
  text?: string
  src?: string
  w?: number
  h?: number
}
type SearchProps = {
  enabled: boolean
  placeholder?: string
  width?: number
}

function HeaderButton({ data }: { data: ButtonProps }) {
  const Tag: any = data.href ? 'a' : 'button'
  const base = [
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

function HeaderSearch({ data }: { data: SearchProps }) {
  return (
    <input
      type="text"
      placeholder={data.placeholder ?? ''}
      className="h-8 rounded-lg border border-[#94a3b8] bg-transparent px-2 text-sm text-[#e5e7eb]"
      style={{ width: data.width ?? 200 }}
      onPointerDown={(e) => e.stopPropagation()}
    />
  )
}

export function HeaderView({ elm }: { elm: Elm }) {
  const props = elm.props as any
  const navItems: NavItem[] | undefined = props?.navItems
  const logo = props?.logo as Logo | undefined
  const search = props?.search as SearchProps | undefined
  const sticky: boolean | undefined = props?.sticky
  const shadowOnScroll: boolean | undefined = props?.shadowOnScroll
  const shadowPreview: boolean | undefined = props?.shadowPreview

  const shadowCls = shadowOnScroll && shadowPreview ? 'shadow-md' : 'shadow-none'
  const stickyCls = sticky ? 'sticky top-0 z-10' : ''

  // --- Logo handling ---
  const [imgErr, setImgErr] = React.useState(false)
  React.useEffect(() => {
    setImgErr(false)
  }, [logo?.src])

  let logoEl: React.ReactNode = null
  if (logo) {
    const size = { width: logo.w, height: logo.h }
    if (logo.kind === 'image' && logo.src && !imgErr) {
      const alt = logo.text || elm.code?.displayName || ''
      logoEl = (
        <img
          src={logo.src}
          alt={alt}
          style={size}
          onError={() => setImgErr(true)}
          className="object-contain"
        />
      )
    } else {
      logoEl = (
        <div style={size} className="flex items-center">
          {logo.text ?? ''}
        </div>
      )
    }
  }

  return (
    <div
      className={`h-full w-full flex items-center px-3 relative ${shadowCls} ${stickyCls}`}
      style={sticky ? { position: 'sticky', top: 0, zIndex: 10 } : undefined}
    >
      {/* 左: Logo */}
      {logoEl && <div className="mr-3 flex items-center">{logoEl}</div>}

      {/* 中央: Navigation */}
      <div className="flex-1 h-full flex items-center">
        {navItems?.length ? (
          <nav className="flex gap-4">
            {navItems.map((item) => {
              const Tag: any = item.href ? 'a' : 'span'
              const tagProps = item.href ? { href: item.href } : {}
              const active = item.active ? 'font-bold underline' : undefined
              return (
                <Tag key={item.id} {...tagProps} className={active}>
                  {item.label}
                </Tag>
              )
            })}
          </nav>
        ) : (
          'Header'
        )}
      </div>

      {/* 右: Search + CTA + Login */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
        {search?.enabled && <HeaderSearch data={search} />}
        {props?.cta?.enabled && <HeaderButton data={props.cta} />}
        {props?.loginButton?.enabled && (
          <HeaderButton data={props.loginButton} />
        )}
      </div>
    </div>
  )
}
