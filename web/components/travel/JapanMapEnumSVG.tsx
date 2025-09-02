'use client'
import React from 'react'
import { JapanMap } from '@repo/comp-maps-jp/JapanMap'
import type { PrefCode } from '@repo/comp-maps-jp/types'
import { usePrefPaintEnum } from '@/store/prefPaintEnumStore'
import { getMapPalette } from '@/lib/mapPalette'

export type Enum = 0 | 1 | 2 | 3
export type Props = {
  clickable?: boolean
  paletteId?: string
  palette?: Partial<{ none: string; want: string; visited: string; lived: string; stroke: string }>
  showLabels?: boolean
  className?: string
}

export default function JapanMapEnumSVG({
  clickable = true,
  paletteId,
  palette,
  showLabels = false,
  className,
}: Props) {
  const painted = usePrefPaintEnum((s) => s.painted)
  const cycle = usePrefPaintEnum((s) => s.cycle)
  const pal = getMapPalette(paletteId)
  const colors = {
    none: palette?.none ?? pal.none,
    want: palette?.want ?? pal.want,
    visited: palette?.visited ?? pal.visited,
    lived: palette?.lived ?? pal.lived,
    stroke: palette?.stroke ?? pal.stroke,
  }

  const getFill = (code: PrefCode) => {
    const v = painted[code] ?? 0
    switch (v) {
      case 1:
        return colors.want
      case 2:
        return colors.visited
      case 3:
        return colors.lived
      default:
        return colors.none
    }
  }

  const handleClick = (code: PrefCode) => {
    if (!clickable) return
    cycle(code)
  }

  return (
    <JapanMap
      values={{}}
      showLabels={showLabels}
      palette={{ visited: colors.visited, lived: colors.lived, passed: colors.want, none: colors.none, stroke: colors.stroke }}
      strokeWidth={1}
      labelKind={showLabels ? 'pref' : 'none'}
      getFill={getFill}
      onPrefClick={handleClick}
      className={className}
      svgProps={{ role: 'img', 'aria-label': 'Japan prefectures map' }}
    />
  )
}
