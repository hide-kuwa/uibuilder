'use client'
import Image from 'next/image'

type RibbonProps = {
  images: string[]            // 画像URL（objectURL推奨）
  height?: number             // px
  durationSec?: number        // アニメ時間（長いほどゆっくり）
  direction?: 'left' | 'right'
  gap?: number                // 画像間ギャップpx
  rounded?: string            // 角丸クラス（例 'rounded-xl')
}

/** 画像を2回連結して 200% 幅にし、左右に無限スクロール */
export default function ScrollingRibbon({
  images, height = 140, durationSec = 30, direction = 'left', gap = 8, rounded = 'rounded-lg',
}: RibbonProps) {
  if (!images?.length) {
    return (
      <div className="grid place-items-center rounded-xl border bg-white/50 p-4 text-xs text-gray-500" style={{ height }}>
        画像がありません
      </div>
    )
  }

  // つなぎ目を消すために2倍化
  const srcs = [...images, ...images]

  return (
    <div className={`relative overflow-hidden ${rounded}`} style={{ height }}>
      <div
        className="absolute left-0 top-0 flex"
        style={{
          width: '200%',
          gap,
          animationName: direction === 'left' ? 'marquee-left' : 'marquee-right',
          animationDuration: `${durationSec}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
        }}
      >
        {srcs.map((src, i) => (
          <div key={i} className="relative shrink-0" style={{ height, aspectRatio: '16 / 10' }}>
            {/* next/image を使うと自然に最適化される */}
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes={`${height * 2}px`}
              priority={i < 4}
            />
          </div>
        ))}
      </div>
      {/* 上に薄いグラデで端フェード */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/50 via-transparent to-white/50" />
    </div>
  )
}
