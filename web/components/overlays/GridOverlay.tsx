'use client'
import React, { useEffect, useRef } from 'react'
import { useGridStore } from '@/store/gridStore'

type OffsetFn = (wx: number, wy: number) => { sx: number; sy: number }

/** 注意: 親のパン/ズームが transform でかかっている場合、
 *  world→screen オフセット関数を渡すとずれません（未指定なら 1:1 前提）。
 */
export function GridOverlay({
  width,
  height,
  zoom = 1,
  worldToScreenOffset,
}: {
  width: number
  height: number
  zoom?: number
  worldToScreenOffset?: OffsetFn
}) {
  const { showGrid, pitch, subDiv, offsetX, offsetY, minGapPx } = useGridStore()
  const cv = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!showGrid || !cv.current) return
    const canvas = cv.current
    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio || 1

    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    // 画面pxのグリッド間隔（ズーム反映）
    let step = pitch * zoom
    let minor = step
    while (minor < minGapPx) minor *= subDiv
    const major = minor * subDiv

    // ワールド原点のスクリーン位置
    const origin = worldToScreenOffset
      ? worldToScreenOffset(offsetX, offsetY)
      : { sx: offsetX * zoom, sy: offsetY * zoom }

    // 最初の描画位置（0 から見て負の方向にずらした mod）
    const mod = (a: number, n: number) => ((a % n) + n) % n
    const startX = mod(-origin.sx, minor)
    const startY = mod(-origin.sy, minor)

    // マイナー
    ctx.beginPath()
    ctx.strokeStyle = 'rgba(148,163,184,0.35)' // slate-400相当
    ctx.lineWidth = 1
    for (let x = startX; x <= width; x += minor) {
      ctx.moveTo(x, 0); ctx.lineTo(x, height)
    }
    for (let y = startY; y <= height; y += minor) {
      ctx.moveTo(0, y); ctx.lineTo(width, y)
    }
    ctx.stroke()

    // メジャー
    const startXMaj = mod(-origin.sx, major)
    const startYMaj = mod(-origin.sy, major)
    ctx.beginPath()
    ctx.strokeStyle = 'rgba(148,163,184,0.65)'
    for (let x = startXMaj; x <= width; x += major) {
      ctx.moveTo(x, 0); ctx.lineTo(x, height)
    }
    for (let y = startYMaj; y <= height; y += major) {
      ctx.moveTo(0, y); ctx.lineTo(width, y)
    }
    ctx.stroke()
  }, [showGrid, width, height, zoom, pitch, subDiv, offsetX, offsetY, minGapPx, worldToScreenOffset])

  if (!showGrid) return null
  return <canvas ref={cv} className="pointer-events-none absolute inset-0" />
}

