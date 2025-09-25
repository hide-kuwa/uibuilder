'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { ActionPresetList } from '@/components/actions/ActionPresetList'
import { ActionPresetEditor } from '@/components/actions/ActionPresetEditor'
import { ActionPreview } from '@/components/actions/ActionPreview'
import type { ActionPreset } from '@/lib/actions/types'
import { useActionsStore } from '@/stores/actions'

type SaveStatus = 'idle' | 'saving' | 'error'

type StoreSnapshot = {
  list: string[]
  presets: Record<string, ActionPreset>
  currentId?: string
}

const DEFAULT_PROJECT_ID = 'dev-actions'

const emptySnapshot: StoreSnapshot = { list: [], presets: {}, currentId: undefined }

export default function DevActionsPage() {
  const searchParams = useSearchParams()
  const projectId = React.useMemo(
    () => searchParams?.get('project')?.trim() || DEFAULT_PROJECT_ID,
    [searchParams],
  )

  const currentId = useActionsStore((state) => state.currentId)
  const presets = useActionsStore((state) => state.presets)
  const currentPreset = currentId ? presets[currentId] : undefined

  const [loading, setLoading] = React.useState(true)
  const [status, setStatus] = React.useState<SaveStatus>('idle')
  const loadedRef = React.useRef(false)

  React.useEffect(() => {
    let active = true
    loadedRef.current = false
    setLoading(true)
    setStatus('idle')

    const applyState = (input: any) => {
      if (!active) return
      let list: string[] = []
      const presetsMap: Record<string, ActionPreset> = {}
      let current: string | undefined

      if (Array.isArray(input)) {
        input.forEach((item: any) => {
          if (item && typeof item.id === 'string') {
            list.push(item.id)
            presetsMap[item.id] = item as ActionPreset
          }
        })
      } else if (input && typeof input === 'object') {
        const rawList = Array.isArray(input.list) ? input.list : []
        const rawPresets =
          input.presets && typeof input.presets === 'object' ? (input.presets as Record<string, any>) : {}
        rawList.forEach((id: any) => {
          if (typeof id === 'string' && rawPresets[id]) {
            list.push(id)
            presetsMap[id] = rawPresets[id] as ActionPreset
          }
        })
        if (!list.length) {
          Object.entries(rawPresets).forEach(([id, preset]) => {
            if (typeof id === 'string') {
              list.push(id)
              presetsMap[id] = preset as ActionPreset
            }
          })
        }
        if (typeof input.currentId === 'string') current = input.currentId
      }

      list = Array.from(new Set(list))
      if (current && !list.includes(current)) current = list[0]
      if (!current && list.length) current = list[0]

      useActionsStore.setState({ list, presets: presetsMap, currentId: current })
    }

    const load = async () => {
      try {
        const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/actions`, {
          cache: 'no-store',
        })
        if (!active) return
        if (res.ok) {
          const data = await res.json()
          applyState(data)
        } else {
          applyState(emptySnapshot)
        }
      } catch (err) {
        console.error('Failed to load action presets', err)
        applyState(emptySnapshot)
      } finally {
        if (active) {
          loadedRef.current = true
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [projectId])

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    let abortController: AbortController | undefined

    const persist = (snapshot: StoreSnapshot) => {
      if (!loadedRef.current) return
      if (timer) clearTimeout(timer)
      timer = setTimeout(async () => {
        abortController?.abort()
        abortController = new AbortController()
        setStatus('saving')
        try {
          const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/actions`, {
            method: 'PUT',
            body: JSON.stringify(snapshot),
            headers: { 'Content-Type': 'application/json' },
            signal: abortController.signal,
          })
          if (!res.ok) throw new Error('Failed to persist presets')
          setStatus('idle')
        } catch (err: any) {
          if (err?.name === 'AbortError') return
          console.error('Failed to save action presets', err)
          setStatus('error')
        }
      }, 400)
    }

    const unsubscribe = useActionsStore.subscribe(
      (state) => ({ list: state.list, presets: state.presets, currentId: state.currentId }),
      persist,
    )

    return () => {
      unsubscribe()
      if (timer) clearTimeout(timer)
      abortController?.abort()
    }
  }, [projectId])

  const handleAction = React.useCallback((action: any, preset: ActionPreset) => {
    console.log(`[dev/actions] ${action}`, preset)
  }, [])

  return (
    <main className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-6 py-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-xl font-semibold text-white">/dev/actions</h1>
          <span className="text-xs text-neutral-500">Project: {projectId}</span>
        </div>
        <p className="mt-1 text-sm text-neutral-400">
          Manage action presets, preview interactions, and import/export JSON definitions.
        </p>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-full max-w-xs border-r border-neutral-800 bg-neutral-950 p-4">
          <ActionPresetList status={status} />
        </aside>
        <section className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          <div className="flex-1 overflow-hidden border-b border-neutral-800 bg-neutral-950 p-4 lg:border-b-0 lg:border-r">
            <ActionPresetEditor preset={currentPreset} onAction={handleAction} />
          </div>
          <div className="w-full max-w-md border-t border-neutral-800 bg-neutral-950 p-4 lg:h-full lg:border-l lg:border-t-0">
            <ActionPreview preset={currentPreset} />
          </div>
        </section>
      </div>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-neutral-950/70 text-sm text-neutral-300">
          Loading presets…
        </div>
      )}
    </main>
  )
}
