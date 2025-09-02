'use client'
export const dynamic = 'force-dynamic'
import React from 'react'
import LoginButton from '@/components/auth/LoginButton'
import PrefShareBar from '@/components/travel/PrefShareBar'
import PrefGridMap from '@/components/travel/PrefGridMap'
import DownloadPNG from '@/components/util/DownloadPNG'

export default function TravelDemoPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">地図コレ・ぬりえ（デモ）</h1>
        <LoginButton />
      </div>

      <div id="mapCard" className="rounded-2xl border shadow-sm p-4 space-y-3 bg-background">
        <PrefShareBar />
        <PrefGridMap />
        <div className="flex items-center gap-2">
          <DownloadPNG targetId="mapCard" fileName="my-map.png" />
          {/* スマホでそのまま共有したいなら share を true */}
          {/* <DownloadPNG targetId="mapCard" fileName="my-map.png" share /> */}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        カード右下の「PNGで保存」で、今の塗りを画像にできます。
      </p>

      <p className="text-sm">
        <a className="underline" href="/discover">Discover</a> /
        <a className="underline ml-2" href="/feed">フォロー中の新着</a>
      </p>
    </div>
  )
}
