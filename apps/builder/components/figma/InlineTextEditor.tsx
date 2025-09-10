'use client'
import { useEffect, useRef, useState } from 'react'
import { useFigmaStore } from '../../lib/figma/store'

export default function InlineTextEditor({ nodeId, initialText }:{nodeId:string; initialText:string}) {
  const stopEditingText = useFigmaStore((s)=>s.stopEditingText)
  const setTextContent = useFigmaStore((s)=>s.setTextContent)
  const [value, setValue] = useState(initialText)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(()=>{ ref.current?.focus(); ref.current?.select() }, [])

  const commit = () => { setTextContent(nodeId, value); stopEditingText() }

  return (
    <input ref={ref}
      className="absolute left-0 top-0 w-full border-none outline-none bg-transparent p-1 text-sm"
      value={value}
      onChange={(e)=>setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e)=>{ if(e.key==='Enter') commit(); if(e.key==='Escape') stopEditingText() }}
    />
  )
}

