'use client'
import React, { useState } from 'react'
import * as htmlToImage from 'html-to-image'

type Props = {
  targetId: string         // キャプチャするDOMのid
  fileName?: string        // 保存ファイル名
  pixelRatio?: number      // 解像度倍率（2でRetina相当）
  share?: boolean          // trueなら対応ブラウザでWeb Share試行
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(',')
  const mime = meta.match(/data:(.*);base64/)?.[1] ?? 'image/png'
  const bin = atob(b64)
  const len = bin.length
  const u8 = new Uint8Array(len)
  for (let i = 0; i < len; i++) u8[i] = bin.charCodeAt(i)
  return new Blob([u8], { type: mime })
}

export default function DownloadPNG({ targetId, fileName='map.png', pixelRatio=2, share=false }: Props) {
  const [busy, setBusy] = useState(false)

  const run = async () => {
    const node = document.getElementById(targetId)
    if (!node) return alert(`target #${targetId} が見つかりません`)
    setBusy(true)
    try {
      const dataUrl = await htmlToImage.toPng(node, {
        cacheBust: true,
        pixelRatio,
        // foreignObjectRendering: true, // 必要に応じて
        quality: 1,
      })

      if (share && 'canShare' in navigator) {
        try {
          const blob = dataUrlToBlob(dataUrl)
          const file = new File([blob], fileName, { type: 'image/png' })
          // @ts-ignore - types narrow check
          if ((navigator as any).canShare?.({ files: [file] })) {
            await (navigator as any).share({
              files: [file],
              title: '地図コレ',
              text: '私の都道府県ぬりえ',
            })
            setBusy(false)
            return
          }
        } catch {
          /* Web Share失敗時はダウンロードにフォールバック */
        }
      }

      // ダウンロード
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (e: any) {
      console.error(e)
      alert('画像生成に失敗しました（外部画像が混ざると失敗することがあります）')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      className="px-3 py-2 border rounded text-sm"
      onClick={run}
      disabled={busy}
      title="地図カードをPNG保存"
    >
      {busy ? '生成中…' : 'PNGで保存'}
    </button>
  )
}
