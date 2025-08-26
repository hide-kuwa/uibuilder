'use client'
import React from 'react'
import type { Elm } from '@/store/builderStore'

type LoginButton = NonNullable<Elm['props']>['loginButton']

function HeaderLoginButton({ data }: { data: LoginButton }) {
  const Tag: any = data.href ? 'a' : 'button'
  const base = [
    'absolute right-3 top-1/2 -translate-y-1/2',
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
  return (
    <>
      <div className="h-full flex items-center px-3">Header</div>
      {elm.props?.loginButton?.enabled && (
        <HeaderLoginButton data={elm.props.loginButton} />
      )}
    </>
  )
}

