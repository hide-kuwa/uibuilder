'use client'
import React from 'react'
import { CanvasStage } from '@/components/editor'
import LayersPanel from '@/components/sidebar/LayersPanel'
import ExportPanel from '@/components/editor/ExportPanel'
import { seedToStore, markPreviousCrashedForTest } from '@/dev/seed'
import { useEditorStore } from '@/store/editorStore'
import { LoadFromCode } from '@/components/LoadFromCode'
import { ExportCode } from '@/components/ExportCode'

export default function DevPages() {
  const s = useEditorStore()
  return (
    <div className="p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Dev / Pages</h1>
        <div className="flex gap-2">
          <LoadFromCode />
          <ExportCode />
          <button className="px-2 py-1 text-sm rounded bg-zinc-800 border border-zinc-700 hover:bg-zinc-700" onClick={() => seedToStore(100)}>
            Seed 100
          </button>
          <button className="px-2 py-1 text-sm rounded bg-zinc-800 border border-zinc-700 hover:bg-zinc-700" onClick={() => seedToStore(1000)}>
            Seed 1k
          </button>
          <button className="px-2 py-1 text-sm rounded bg-zinc-800 border border-zinc-700 hover:bg-zinc-700" onClick={() => seedToStore(5000)}>
            Seed 5k
          </button>
          <button
            className="px-2 py-1 text-sm rounded bg-amber-800/60 border border-amber-600 hover:bg-amber-700/60"
            title="次回リロードで復旧ダイアログが出ます"
            onClick={() => {
              markPreviousCrashedForTest()
              location.reload()
            }}
          >
            Simulate Crash → Reload
          </button>
          <button
            className="px-2 py-1 text-sm rounded bg-zinc-800 border border-zinc-700 hover:bg-zinc-700"
            onClick={() => s.select([])}
          >
            Unselect
          </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-4">
        <section className="col-span-7 rounded-lg overflow-hidden border border-zinc-800">
          <div className="px-3 py-2 text-sm border-b border-zinc-800 bg-zinc-900/50">CanvasStage</div>
          <div className="h-[70vh] bg-black">
            <CanvasStage />
          </div>
        </section>
        <aside className="col-span-5 space-y-4">
          <div className="rounded-lg overflow-hidden border border-zinc-800">
            <div className="px-3 py-2 text-sm border-b border-zinc-800 bg-zinc-900/50">Layers</div>
            <div className="h-[30vh] overflow-auto">
              <LayersPanel />
            </div>
          </div>
          <div className="rounded-lg overflow-hidden border border-zinc-800">
            <div className="px-3 py-2 text-sm border-b border-zinc-800 bg-zinc-900/50">Export</div>
            <div className="max-h-[40vh] overflow-auto p-3">
              <ExportPanel />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
