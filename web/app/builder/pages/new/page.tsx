'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { usePageStore } from '@/store/pageStore'
import type { PageTemplate } from '../../../../../src/lib/pageTemplates'
import { getTemplates, importTemplates, exportTemplates } from '../../../../../src/lib/pageTemplates'

export default function NewPageWizard() {
  const router = useRouter()
  const addPage = usePageStore((s) => s.addPage)
  const [templates, setTemplates] = React.useState<PageTemplate[]>([])
  const [selected, setSelected] = React.useState<PageTemplate | null>(null)
  const [title, setTitle] = React.useState('')
  const [path, setPath] = React.useState('/')

  React.useEffect(() => {
    setTemplates(getTemplates())
  }, [])

  const onCreate = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const id = addPage({ title: title || 'New Page', path: (path || '/new-page') as any, tree: selected?.nodes ?? [] })
      router.push(`/builder/pages/${id}/edit`)
    },
    [addPage, title, path, selected, router],
  )

  const onImport = React.useCallback(() => {
    const json = window.prompt('Paste templates JSON')
    if (json) {
      importTemplates(json)
      setTemplates(getTemplates())
    }
  }, [])

  const onExport = React.useCallback(() => {
    const json = exportTemplates()
    void navigator.clipboard.writeText(json)
    window.alert('Templates copied to clipboard')
  }, [])

  if (!selected) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-bold">Select Page Template</h1>
        <div className="flex flex-wrap gap-2">
          {templates.map((t) => (
            <button
              key={t.id}
              className="px-3 py-1 border rounded hover:bg-zinc-800"
              onClick={() => setSelected(t)}
            >
              {t.name}
            </button>
          ))}
          <button
            className="px-3 py-1 border rounded hover:bg-zinc-800"
            onClick={() => setSelected({ id: '', name: 'Blank', layoutId: '', nodes: [] })}
          >
            Blank
          </button>
        </div>
        <div className="flex gap-2">
          <button className="px-2 py-1 border rounded" onClick={onImport}>
            Import
          </button>
          <button className="px-2 py-1 border rounded" onClick={onExport}>
            Export
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">New Page</h1>
      <form onSubmit={onCreate} className="space-y-2 max-w-xs">
        <div>
          <label className="block text-sm">Title</label>
          <input
            className="w-full px-2 py-1 border rounded bg-transparent"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm">Path</label>
          <input
            className="w-full px-2 py-1 border rounded bg-transparent"
            value={path}
            onChange={(e) => setPath(e.target.value)}
          />
        </div>
        <button type="submit" className="px-3 py-1 border rounded">
          Create
        </button>
        <button type="button" className="px-3 py-1 border rounded ml-2" onClick={() => setSelected(null)}>
          Back
        </button>
      </form>
    </div>
  )
}
