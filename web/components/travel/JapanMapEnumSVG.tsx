'use client'
import React from 'react'
import { JapanMap } from '@repo/comp-maps-jp/JapanMap'
import type { PrefCode } from '@repo/comp-maps-jp/types'
import { usePrefPaintEnum } from '@/store/prefPaintEnumStore'

export type Enum = 0 | 1 | 2 | 3
export type Palette = { none: string; want: string; visited: string; lived: string; stroke?: string }
export type Props = {
  clickable?: boolean
  palette?: Partial<Palette>
  showLabels?: boolean
  className?: string
}

const DEFAULT_PALETTE: Required<Palette> = {
  none: 'hsl(0 0% 98%)',
  want: 'hsl(38 92% 55%)',
  visited: 'hsl(217 91% 60%)',
  lived: 'hsl(0 84% 60%)',
  stroke: '#0b1020',
}

export default function JapanMapEnumSVG({
  clickable = true,
  palette,
  showLabels = false,
  className,
}: Props) {
  const painted = usePrefPaintEnum((s) => s.painted)
  const cycle = usePrefPaintEnum((s) => s.cycle)
  const pal = { ...DEFAULT_PALETTE, ...palette }

  const getFill = (code: PrefCode) => {
    const v = painted[code] ?? 0
    switch (v) {
      case 1:
        return pal.want
      case 2:
        return pal.visited
      case 3:
        return pal.lived
      default:
        return pal.none
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
      palette={{ visited: pal.visited, lived: pal.lived, passed: pal.want, none: pal.none, stroke: pal.stroke }}
      strokeWidth={1}
      labelKind={showLabels ? 'pref' : 'none'}
      getFill={getFill}
      onPrefClick={handleClick}
      className={className}
      svgProps={{ role: 'img', 'aria-label': 'Japan prefectures map' }}
    />
  )
}
