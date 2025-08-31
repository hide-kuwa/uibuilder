'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { loadLatest, saveState, addSnapshot, trimSnapshots } from '@/lib/idb'
import { useBuilderStore } from '@/store/builderStore'

type AutoSaveStatus = { saving: boolean; lastSavedAt: number | null; error: string | null }

function selectSerializableState(s: any) {
  return { tree: s.tree, components: s.components, meta: s.meta }
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function useAutoSave(projectId: string, schemaVersion: number, debounceMs = 800): AutoSaveStatus {
  const [status, setStatus] = useState<AutoSaveStatus>({ saving: false, lastSavedAt: null, error: null })
  const subRef = useRef<() => void>()
  const timer = useRef<any>(null)
  const lastJson = useRef<string>('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const latest = await loadLatest(projectId)
      if (mounted && latest?.data) {
        useBuilderStore.setState({ ...(latest.data || {}) })
      }
    })()
    return () => { mounted = false }
  }, [projectId])

  const selector = useMemo(() => (s: any) => selectSerializableState(s), [])
  useEffect(() => {
    const unsub = useBuilderStore.subscribe(selector, async (next) => {
      const j = JSON.stringify(next)
      if (j === lastJson.current) return
      lastJson.current = j
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(async () => {
        try {
          setStatus(s => ({ ...s, saving: true, error: null }))
          const payload = { schemaVersion, projectId, updatedAt: Date.now(), data: next }
          await saveState(payload)
          const snap: any = { id: uid(), projectId, createdAt: payload.updatedAt, data: next }
          await addSnapshot(snap)
          await trimSnapshots(projectId, 20, 24, 30)
          setStatus({ saving: false, lastSavedAt: payload.updatedAt, error: null })
        } catch (e: any) {
          setStatus({ saving: false, lastSavedAt: status.lastSavedAt, error: e?.message || 'save failed' })
        }
      }, debounceMs)
    })
    subRef.current = unsub
    return () => {
      if (timer.current) clearTimeout(timer.current)
      unsub()
    }
  }, [projectId, schemaVersion, debounceMs])

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (status.saving) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [status.saving])

  return status
}

