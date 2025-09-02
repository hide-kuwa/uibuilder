'use client'
import React from 'react'

export type PlaceGalleryProps = {
  images?: string[]
}

export default function PlaceGallery({ images = [] }: PlaceGalleryProps) {
  if (images.length === 0) {
    return <div className="text-xs text-muted-foreground">No images</div>
  }
  return (
    <div className="grid grid-cols-3 gap-2">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          className="w-full h-24 object-cover rounded-md border"
        />
      ))}
    </div>
  )
}
