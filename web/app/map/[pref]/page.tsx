'use client'
import Link from 'next/link'
import PrefGallery from '@/components/gallery/PrefGallery'
import type { PrefName } from '@/lib/prefectures'

export default function PrefPage({ params }: { params: { pref: string } }) {
  const pref = decodeURIComponent(params.pref) as PrefName

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{pref}</h1>
        <div className="flex gap-2">
          <Link href={`/dev/share?pref=${encodeURIComponent(pref)}`} className="rounded-md border px-3 py-2 text-sm">
            Share動画を作る
          </Link>
          <Link href="/map" className="rounded-md border px-3 py-2 text-sm">← Back to map</Link>
        </div>
      </div>

      {/* 上下に流れるギャラリー */}
      <PrefGallery pref={pref} />

      <div className="text-xs text-gray-500">
        Google Drive の「地図コレ / {pref}」に入っている写真が自動で表示されます。
      </div>
    </div>
  )
}
