'use client'
import React from 'react'
import type { Elm } from '@/store/builderStore'

type LoginButton = NonNullable<Elm['props']>['loginButton']
type Logo = {
  kind: 'text' | 'image'
  text?: string
  src?: string
  w?: number
  h?: number
}

function HeaderLoginButton({ data }: { data: LoginButton }) {
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
  const logo = (elm.props as any)?.logo as Logo | undefined
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
    <div className="h-full w-full flex items-center px-3">
      {logoEl && <div className="mr-3 flex items-center">{logoEl}</div>}
      <div className="flex-1 h-full flex items-center">
        {elm.props?.text ?? 'Header'}
      </div>
      {elm.props?.loginButton?.enabled && (
        <HeaderLoginButton data={elm.props.loginButton} />
      )}
    </div>
  )
}

