'use client'

import { useBuilderLayout } from '@/stores/builderLayout'

const renderPanel = (panel: string | undefined) => {
  switch (panel) {
    case 'toolbar':
      return <Toolbar />
    case 'palette':
      return <Palette />
    case 'inspector':
      return <Inspector />
    default:
      return null
  }
}

export default function BuilderPage() {
  const { layout } = useBuilderLayout()

  return (
    <div className="grid grid-rows-[48px_minmax(0,1fr)_48px] grid-cols-[260px_1fr_280px] h-[calc(100vh-64px)]">
      {/* Top */}
      <div className="col-span-3 border-b border-zinc-800">{renderPanel(layout.top)}</div>

      {/* Left */}
      <div className="border-r border-zinc-800">{renderPanel(layout.left)}</div>

      {/* Center = Canvas 固定 */}
      <div className="overflow-hidden">
        <Canvas />
      </div>

      {/* Right */}
      <div className="border-l border-zinc-800">{renderPanel(layout.right)}</div>

      {/* Bottom */}
      <div className="col-span-3 border-t border-zinc-800">{renderPanel(layout.bottom)}</div>
    </div>
  )
}

// ここは実アプリのものに置き換えてね
function Toolbar() {
  return <div className="h-full px-3 flex items-center text-sm">Toolbar</div>
}
function Palette() {
  return <div className="h-full p-3 text-sm">Palette</div>
}
function Inspector() {
  return <div className="h-full p-3 text-sm">Inspector</div>
}
function Canvas() {
  return <div className="h-full bg-zinc-900/30">Canvas</div>
}

