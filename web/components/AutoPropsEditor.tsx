'use client'
import React from 'react'

interface Props {
  selectedComponentType: string
  selectedProps: Record<string, any>
  onChange: (next: Record<string, any>) => void
}

const AutoPropsEditor: React.FC<Props> = ({ selectedProps, onChange }) => {
  return (
    <textarea
      className="w-full border rounded px-2 py-1 text-xs"
      value={JSON.stringify(selectedProps, null, 2)}
      onChange={e => {
        try {
          onChange(JSON.parse(e.target.value))
        } catch {
        }
      }}
    />
  )
}

export default AutoPropsEditor

