'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const ComponentPalette = dynamic(() => import('../../../../src/ComponentPalette'), {
  ssr: false,
})

const TAB_KEY = 'palette'

function PalettePanel() {
  return (
    <div
      data-leftpane-panel="palette"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        height: '100%',
        padding: 8,
        overflow: 'hidden',
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>
        Palette
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <ComponentPalette />
      </div>
    </div>
  )
}

function registerPaletteTab(attempt = 0) {
  if (typeof window === 'undefined') return
  const w = window as typeof window & {
    registerLeftPaneTab?:
      | ((tab: { key: string; label: string; render: () => JSX.Element }) => void)
      | ((key: string, label: string, render: () => JSX.Element) => void)
    __leftPanePaletteRegistered?: boolean
  }

  if (w.__leftPanePaletteRegistered) return
  const register = w.registerLeftPaneTab

  if (typeof register !== 'function') {
    if (attempt < 5) {
      setTimeout(() => registerPaletteTab(attempt + 1), 200 * (attempt + 1))
    }
    return
  }

  const render = () => <PalettePanel />

  try {
    ;(register as (tab: { key: string; label: string; render: () => JSX.Element }) => void)({
      key: TAB_KEY,
      label: 'Palette',
      render,
    })
    w.__leftPanePaletteRegistered = true
    return
  } catch {}

  try {
    ;(register as (key: string, label: string, render: () => JSX.Element) => void)(
      TAB_KEY,
      'Palette',
      render,
    )
    w.__leftPanePaletteRegistered = true
  } catch {}
}

if (typeof window !== 'undefined') {
  registerPaletteTab()
}

export function RegisterPaletteTabOnce() {
  React.useEffect(() => {
    registerPaletteTab()
  }, [])
  return null
}

export default RegisterPaletteTabOnce
