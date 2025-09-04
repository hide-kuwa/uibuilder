'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function DevPages() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-lg font-semibold">Dev Utilities</h1>

      <section className="rounded-2xl border bg-white p-4">
        <div className="mb-2 text-sm font-medium">Pages</div>
        <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {[
            ['/builder','Builder'],
            ['/dev/arrange','Arrange'],
            ['/dev/actions','Actions'],
            ['/dev/share','Share Movie'],
            ['/map?preview=1','Map (preview)'],
            ['/map','Map (published)'],
          ].map(([href, label]) => (
            <li key={href}>
              <Link className="inline-block rounded border px-3 py-2 text-sm hover:bg-gray-50" href={href}>{label}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border bg-white p-4">
        <div className="mb-2 text-sm font-medium">Toggles</div>
        <label className="mr-4 inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={dark} onChange={(e)=> setDark(e.target.checked)} />
          Dark mode
        </label>
        {/* React Query Devtools / Zustand Devtools は導入済みならここで表示切替を入れてOK */}
      </section>

      <section className="rounded-2xl border bg-white p-4">
        <div className="mb-1 text-sm font-medium">Mock Switch</div>
        <p className="text-xs text-gray-600">環境に応じて API をモックへ切替（実装中のフラグ置き場）</p>
      </section>

      <section className="rounded-2xl border bg-white p-4">
        <div className="mb-1 text-sm font-medium">Unused Components</div>
        <p className="text-xs text-gray-600">将来: ビルド時のレポートから自動収集。暫定は手動リストでOK。</p>
      </section>
    </div>
  )
}
