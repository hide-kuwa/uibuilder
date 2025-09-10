'use client'
import Canvas from './Canvas'
import RightPanel from './RightPanel'

export default function FigmaDev() {
  return (
    <div className="h-screen w-screen grid grid-cols-[1fr_320px]">
      <div className="h-full w-full bg-[linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(0deg,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:8px_8px]">
        <Canvas />
      </div>
      <div className="h-full border-l border-gray-200 bg-white">
        <RightPanel />
      </div>
    </div>
  )
}

