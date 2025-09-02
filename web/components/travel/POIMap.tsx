'use client'
import React from 'react'

export type POIMarker = { id: string; x: number; y: number; label?: string }
export type POIMapProps = {
  markers?: POIMarker[]
}

export default function POIMap({ markers = [] }: POIMapProps) {
  return (
    <div className="relative w-full h-full bg-muted">
      {markers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
          No markers
        </div>
      )}
      {markers.map((m) => (
        <div
          key={m.id}
          className="absolute w-2 h-2 rounded-full bg-primary"
          style={{ left: m.x, top: m.y }}
          title={m.label}
        />
      ))}
    </div>
  )
}
