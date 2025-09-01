'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function SiteHeader() {
  const [busy, setBusy] = useState(false)

  // next-auth が入っていれば signIn()、無ければ /login に遷移
  const handleLogin = async () => {
    try {
      setBusy(true)
      // 動的 import（未導入でも落ちない）
      const mod = await import('next-auth/react').catch(() => null)
      if (mod?.signIn) await mod.signIn()
      else window.location.href = '/login'
    } finally {
      setBusy(false)
    }
  }

  return (
    <header className="w-full border-b"
            style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}>
      <div className="mx-auto max-w-6xl flex items-center justify-between gap-4 px-4 h-12">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold">UI Builder</Link>
          <nav className="hidden md:flex items-center gap-3 text-sm text-[color:var(--muted)]">
            <Link href="/builder">Builder</Link>
            <Link href="/dev/pages">Dev</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogin}
            className="btn btn-sm"
            disabled={busy}
            aria-busy={busy}
          >
            {busy ? '…' : 'ログイン'}
          </button>
        </div>
      </div>
    </header>
  )
}
