'use client'
import React from 'react'

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/

type Props = {
  value?: string
  onChange: (v: string) => void
}

// Renders a color picker with text fallback for non-hex values.
export default function ColorInput({ value = '', onChange }: Props) {
  const isHex = HEX.test(value)
  return (
    <div className="flex items-center space-x-1">
      <input
        type="color"
        value={isHex ? value : '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 p-0 border rounded"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded px-1 py-0.5 w-24"
      />
    </div>
  )
}
