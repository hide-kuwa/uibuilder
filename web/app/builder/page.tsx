'use client'
import React from 'react'
import Toolbar from '../../components/Toolbar'
import VersionsPanel from '../../components/VersionsPanel'
import Canvas from '../../components/Canvas'
import Library from '../../components/Library'
import Inspector from '../../components/Inspector'
import LoadInitialTree from '../../components/LoadInitialTree'
import { EditorProvider } from '../../components/store'

export default function BuilderPage() {
  return (
    <EditorProvider initialTree={[]}>
      <div className="h-screen flex flex-col">
        <Toolbar />
        <LoadInitialTree />
        <div className="flex flex-1 min-h-0">
          <div className="w-60 border-r overflow-y-auto"><Library/></div>
          <div className="flex-1 overflow-auto"><Canvas/></div>
          <div className="w-80 border-l overflow-y-auto"><Inspector/></div>
          <VersionsPanel />
        </div>
      </div>
    </EditorProvider>
  )
}

