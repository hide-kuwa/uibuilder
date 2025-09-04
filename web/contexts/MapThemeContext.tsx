'use client'
import React, { createContext, useContext, useMemo } from 'react'
import { getMapPalette } from '@/lib/mapPalette'

const Ctx = createContext<{paletteId: string; vars: React.CSSProperties}>({ paletteId: 'default', vars: {} })

export const MapThemeProvider = ({ id = 'default', children }: { id?: string; children: React.ReactNode }) => {
  const pal = getMapPalette(id)
  const vars = useMemo(
    () =>
      ({
        ['--map-none']: pal.none,
        ['--map-want']: pal.want,
        ['--map-visited']: pal.visited,
        ['--map-lived']: pal.lived,
        ['--map-stroke']: pal.stroke,
      } as React.CSSProperties),
    [id],
  )
  return (
    <Ctx.Provider value={{ paletteId: id, vars }}>
      <div style={vars}>{children}</div>
    </Ctx.Provider>
  )
}

export const useMapTheme = () => useContext(Ctx)
