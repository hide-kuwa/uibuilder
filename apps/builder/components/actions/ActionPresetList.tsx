'use client'

import * as React from 'react'
import { useActionsStore } from '@/stores/actions'
import type { ActionPreset } from '@/lib/actions/types'

type Props = {
  status?: 'idle' | 'saving' | 'error'
}

const fmt = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function ActionPresetList({ status = 'idle' }: Props) {
  const list = useActionsStore((state) => state.list)
  const presets = useActionsStore((state) => state.presets)
  const currentId = useActionsStore((state) => state.currentId)
  const createPreset = useActionsStore((state) => state.createPreset)
  const duplicatePreset = useActionsStore((state) => state.duplicate)
  const removePreset = useActionsStore((state) => state.remove)
  const setCurrent = useActionsStore((state) => state.setCurrent)
  const importPresets = useActionsStore((state) => state.import)
  const exportPresets = useActionsStore((state) => state.export)

  const [query, setQuery] = React.useState('')
  const [activeTags, setActiveTags] = React.useState<string[]>([])
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const toggleTag = React.useCallback((tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    )
  }, [])

  const allPresets = React.useMemo(() => {
    return list
      .map((id) => presets[id])
      .filter((preset): preset is ActionPreset => !!preset)
  }, [list, presets])

  const allTags = React.useMemo(() => {
    const tags = new Set<string>()
    allPresets.forEach((preset) => {
      preset.tags?.forEach((tag) => {
        if (tag.trim()) tags.add(tag)
      })
    })
    return Array.from(tags).sort((a, b) => a.localeCompare(b))
  }, [allPresets])

  const filtered = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return allPresets.filter((preset) => {
      const matchesQuery = normalizedQuery
        ? preset.name.toLowerCase().includes(normalizedQuery) ||
          (preset.description ?? '').toLowerCase().includes(normalizedQuery)
        : true
      if (!matchesQuery) return false
      if (!activeTags.length) return true
      const tags = preset.tags ?? []
      return activeTags.every((tag) => tags.includes(tag))
    })
  }, [allPresets, activeTags, query])

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (Array.isArray(data)) {
        importPresets(data)
      } else if (Array.isArray(data?.presets)) {
        importPresets(data.presets)
      } else if (Array.isArray(data?.list) && typeof data.presets === 'object') {
        const arr = (data.list as string[])
          .map((id) => (data.presets as Record<string, ActionPreset | undefined>)[id])
          .filter(Boolean)
        importPresets(arr as ActionPreset[])
      } else {
        throw new Error('Invalid JSON format')
      }
    } catch (err) {
      console.error('Failed to import presets', err)
      window.alert('Import failed. Please provide a JSON array of presets.')
    }
  }

  const handleExport = () => {
    try {
      const ids = filtered.map((preset) => preset.id)
      const json = exportPresets(ids)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `action-presets-${new Date()
        .toISOString()
        .replace(/[:.]/g, '-')}.json`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export presets', err)
      window.alert('Export failed. Please try again.')
    }
  }

  const handleRemove = (id: string) => {
    if (window.confirm('Remove this preset?')) removePreset(id)
  }

  const statusLabel =
    status === 'saving'
      ? 'Saving窶ｦ'
      : status === 'error'
      ? 'Save failed'
      : undefined

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 pb-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Presets
          </h2>
          {statusLabel && (
            <span
              className={`text-[11px] font-medium ${
                status === 'error' ? 'text-rose-400' : 'text-neutral-400'
              }`}
            >
              {statusLabel}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={createPreset}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs font-medium hover:bg-neutral-800"
          >
            + New
          </button>
          <button
            type="button"
            onClick={handleImportClick}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs hover:bg-neutral-800"
          >
            Import
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs hover:bg-neutral-800"
            disabled={!filtered.length}
          >
            Export
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
        <div>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search preset names or descriptions"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs text-neutral-200 placeholder:text-neutral-500 focus:border-sky-500 focus:outline-none"
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-[11px]">
            {allTags.map((tag) => {
              const active = activeTags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  className={`rounded-full border px-3 py-1 ${
                    active
                      ? 'border-sky-400 bg-sky-500/10 text-sky-200'
                      : 'border-neutral-700 bg-neutral-900 text-neutral-400 hover:border-neutral-500'
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  #{tag}
                </button>
              )
            })}
            {activeTags.length > 0 && (
              <button
                type="button"
                className="rounded-full border border-neutral-700 px-3 py-1 text-neutral-400 hover:border-neutral-500"
                onClick={() => setActiveTags([])}
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="rounded-md border border-dashed border-neutral-700 bg-neutral-950/40 p-6 text-center text-xs text-neutral-500">
            {query || activeTags.length
              ? 'No presets match the current filters.'
              : 'Create a preset to get started.'}
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((preset) => {
              const isActive = preset.id === currentId
              return (
                <li key={preset.id}>
                  <button
                    type="button"
                    onClick={() => setCurrent(preset.id)}
                    className={`group w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                      isActive
                        ? 'border-sky-500 bg-sky-500/10'
                        : 'border-neutral-800 bg-neutral-950 hover:border-neutral-600 hover:bg-neutral-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-neutral-100 group-hover:text-white">
                          {preset.name || 'Untitled preset'}
                        </div>
                        {preset.tags?.length ? (
                          <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-neutral-400">
                            {preset.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-neutral-800/70 px-2 py-[1px]"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex flex-col items-end gap-1 text-[10px] text-neutral-500">
                        <span>{fmt.format(new Date(preset.updatedAt))}</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="text-xs text-neutral-400 hover:text-neutral-200"
                            onClick={(event) => {
                              event.stopPropagation()
                              duplicatePreset(preset.id)
                            }}
                          >
                            Duplicate
                          </button>
                          <button
                            type="button"
                            className="text-xs text-rose-400 hover:text-rose-200"
                            onClick={(event) => {
                              event.stopPropagation()
                              handleRemove(preset.id)
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                    {preset.description && (
                      <p className="mt-2 line-clamp-2 text-[11px] text-neutral-400">
                        {preset.description}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-wide text-neutral-500">
                      {preset.triggers.map((trigger) => (
                        <span key={trigger} className="rounded bg-neutral-800 px-2 py-[1px]">
                          {trigger}
                        </span>
                      ))}
                      {preset.when?.map((trigger) => (
                        <span key={`when-${trigger}`} className="rounded bg-neutral-800 px-2 py-[1px]">
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
