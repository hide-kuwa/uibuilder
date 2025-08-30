'use client'
import React from 'react'
import type { Elm } from '@/store/builderStore'

export default function ResizeHandles({ elm }: { elm: Elm }) {
  const size = 6
  const handles = [
    { key: 'tl', left: -size, top: -size },
    { key: 'tr', left: elm.w, top: -size },
    { key: 'bl', left: -size, top: elm.h },
    { key: 'br', left: elm.w, top: elm.h },
  ]
  return (
    <>
      {handles.map((h) => (
        <div
          key={h.key}
          className="absolute bg-amber-400"
          style={{ width: size, height: size, left: h.left, top: h.top }}
        />
      ))}
    </>
  )
}
