'use client'
import React from 'react'
import type { Elm } from '@/store/builderStore'

type NavItem = { id: string; label: string; href?: string; active?: boolean }
type ButtonProps = NonNullable<Elm['props']>['loginButton']

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

export function HeaderView({ elm }: { elm: Elm }) {
  const navItems: NavItem[] | undefined = (elm.props as any)?.navItems
  const props = elm.props as any

  return (
    <>
      {/* 左側: Navigation */}
      <div className="h-full flex items-center px-3">
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

      {/* 右側: CTA (Sign up) + Login */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
        {props?.cta?.enabled && <HeaderButton data={props.cta} />}
        {elm.props?.loginButton?.enabled && (
          <HeaderButton data={elm.props.loginButton} />
        )}
      </div>
    </>
  )
}
