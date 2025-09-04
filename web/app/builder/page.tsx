'use client'
import StatusConfigPanel from '@/components/panels/StatusConfigPanel'
import StatusDropdown from '@/components/panels/StatusDropdown'
import { useBuilderStore } from '@/stores/builder'

export default function BuilderPage() {
  const nodes = useBuilderStore(s=> Object.values(s.nodes ?? {}))
  const publishAll = useBuilderStore(s=> s.publishAll)
  const usePublishedOnMap = useBuilderStore(s=> s.usePublishedOnMap)
  const setUsePublishedOnMap = useBuilderStore(s=> s.setUsePublishedOnMap)

  return (
    <div className="space-y-4 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Builder</h1>
        <div className="flex items-center gap-2">
          <label className="text-xs">
            /map は公開版を表示
            <input className="ml-2" type="checkbox" checked={usePublishedOnMap}
              onChange={(e)=> setUsePublishedOnMap(e.target.checked)} />
          </label>
          <button className="rounded border px-3 py-1 text-sm" onClick={publishAll}>Publish</button>
        </div>
      </header>

      <StatusConfigPanel />

      <section className="grid gap-3 md:grid-cols-2">
        {nodes.map(n => (
          <div key={n.id} className="rounded-2xl border bg-white p-3">
            <div className="mb-2 text-sm font-medium">{n.title ?? n.prefecture ?? n.id}</div>
            <StatusDropdown nodeId={n.id} />
          </div>
        ))}
      </section>
    </div>
  )
}
