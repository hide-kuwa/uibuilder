'use client'
import React from 'react'
import Canvas from '../../components/Canvas'
import Library from '../../components/Library'
import Inspector from '../../components/Inspector'
import PublishButton from '../../components/PublishButton'

export default function BuilderPage() {
  return (
    <div className="flex h-screen">
      {/* 左パネル：コンポーネントライブラリ */}
      <div className="w-60 border-r overflow-y-auto">
        <Library />
      </div>

      {/* 中央：キャンバス ＋ Publishボタン */}
      <div className="flex-1 overflow-auto relative">
        <Canvas />
        <div className="absolute top-4 right-4 z-10">
          <PublishButton />
        </div>
      </div>

      {/* 右パネル：プロパティ編集 */}
      <div className="w-80 border-l overflow-y-auto">
        <Inspector />
      </div>
    </div>
  )
}
