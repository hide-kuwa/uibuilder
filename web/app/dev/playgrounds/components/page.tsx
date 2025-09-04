'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { KnobsForm } from './KnobsForm'
import {
  getRegisteredComponents,
  getRegisteredComponent,
  ComponentCategory,
} from './registry'
import { useTheme } from '@/lib/theme/useTheme'

function encodeProps(props: Record<string, any>) {
  if (typeof window === 'undefined') return ''
  return btoa(encodeURIComponent(JSON.stringify(props)))
}

function decodeProps(str: string) {
  return JSON.parse(decodeURIComponent(atob(str)))
}

const tabs: { label: string; type: ComponentCategory }[] = [
  { label: 'Visual', type: 'visual' },
  { label: 'Functional', type: 'functional' },
  { label: 'Invocation', type: 'invocation' },
  { label: 'Layout', type: 'layout' },
]

export default function ComponentsPlayground() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { theme } = useTheme()

  const [tab, setTab] = useState<ComponentCategory>('visual')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [props, setProps] = useState<Record<string, any>>({})

  // load from URL on first render
  useEffect(() => {
    const c = searchParams.get('c')
    const p = searchParams.get('p')
    if (c) {
      setSelectedId(c)
      const comp = getRegisteredComponent(c)
      if (comp) {
        const init = comp.propSchema.parse({})
        if (p) {
          try {
            setProps({ ...init, ...decodeProps(p) })
          } catch {
            setProps(init)
          }
        } else {
          setProps(init)
        }
        setTab(comp.type)
      }
    }
  }, [searchParams])

  const selected = selectedId ? getRegisteredComponent(selectedId) : null
  const Component = selected?.component

  // update URL when props change
  useEffect(() => {
    if (!selectedId) return
    const params = new URLSearchParams()
    params.set('c', selectedId)
    params.set('p', encodeProps(props))
    router.replace(`?${params.toString()}`)
  }, [props, selectedId, router])

  const groups = useMemo(() => {
    const comps = getRegisteredComponents(tab)
    const g: Record<string, typeof comps> = {}
    comps.forEach((c) => {
      c.tags.forEach((t) => {
        if (!g[t]) g[t] = []
        g[t].push(c)
      })
    })
    return g
  }, [tab])

  const handleSelect = (id: string) => {
    setSelectedId(id)
    const comp = getRegisteredComponent(id)
    if (comp) {
      const init = comp.propSchema.parse({})
      setProps(init)
      const params = new URLSearchParams()
      params.set('c', id)
      params.set('p', encodeProps(init))
      router.replace(`?${params.toString()}`)
    }
  }

  return (
    <div className="grid grid-cols-[200px_1fr_250px] h-[calc(100vh-4rem)]">
      <div className="border-r p-2 space-y-2 overflow-y-auto">
        <div className="flex space-x-2 mb-2">
          {tabs.map((t) => (
            <button
              key={t.type}
              className={tab === t.type ? 'font-bold' : ''}
              onClick={() => setTab(t.type)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {Object.entries(groups).map(([tag, comps]) => (
          <div key={tag} className="space-y-1">
            <div className="text-xs font-bold mt-2">{tag}</div>
            {comps.map((c) => (
              <div
                key={c.id}
                className={`cursor-pointer text-sm px-1 rounded ${selectedId === c.id ? 'bg-gray-200' : ''}`}
                onClick={() => handleSelect(c.id)}
              >
                {c.icon} {c.name}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="p-4 overflow-auto">
        {Component && (
          <div data-theme={theme} className="p-4 border rounded">
            <Component {...props} />
          </div>
        )}
      </div>
      <div className="border-l p-4 overflow-y-auto">
        {selected && (
          <KnobsForm schema={selected.propSchema} values={props} onChange={setProps} />
        )}
      </div>
    </div>
  )
}

