'use client'
import React from 'react'
import PrefShareBar from '@/components/travel/PrefShareBar'
import PrefGridMap from '@/components/travel/PrefGridMap'

export default function TravelDemoPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">地図コレ・ぬりえ（デモ）</h1>
      <div className="rounded-2xl border shadow-sm p-4 space-y-3 bg-background">
        <PrefShareBar />
        <PrefGridMap />
      </div>
      <p className="text-sm text-muted-foreground">
        47都道府県をクリックで塗り／外し。<br />
        「シェアリンクをコピー」でURL（?p=Base64）を共有すると、開いた先で自動復元されます。
      </p>
    </div>
  )
}
