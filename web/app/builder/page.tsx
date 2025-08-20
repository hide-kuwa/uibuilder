'use client'
import React from 'react'
import CanvasFree from '../../components/CanvasFree'
import Library from '../../components/Library'
import Inspector from '../../components/Inspector'
import { EditorProvider } from '../../components/store'

const initialTree = [
  { id: 'node1', type: 'div', props: { children: 'Box 1', className: 'bg-gray-200' }, layout: { x: 40, y: 40, w: 320, h: 180 } }
]

export default function BuilderPage() {
  return (
    <EditorProvider initialTree={initialTree}>
      <div className="flex h-screen">
        <div className="w-64 border-r overflow-y-auto"><Library /></div>
        <div className="flex-1 overflow-hidden"><CanvasFree /></div>
        <div className="w-80 border-l overflow-y-auto"><Inspector /></div>
      </div>
    </EditorProvider>
  )
}

