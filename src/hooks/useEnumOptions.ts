import { useEffect, useState } from 'react'
import { useDataSources } from '../dataSources'

type EnumOptions = string[] | { source: string; endpoint: string } | undefined

const cache = new Map<string, string[]>()

export function useEnumOptions(options: EnumOptions): string[] {
  const { sources } = useDataSources()
  const [vals, setVals] = useState<string[]>(Array.isArray(options) ? options : [])

  useEffect(() => {
    if (!options || Array.isArray(options)) return
    const key = `${options.source}:${options.endpoint}`
    if (cache.has(key)) {
      setVals(cache.get(key)!)
      return
    }
    const src = sources.find((s) => s.name === options.source)
    if (!src) {
      const fallback = ['Error loading']
      cache.set(key, fallback)
      setVals(fallback)
      return
    }
    const headers: Record<string, string> = { ...(src.headers || {}) }
    if (src.token) headers['Authorization'] = `Bearer ${src.token}`
    fetch(src.baseURL + options.endpoint, { headers })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          cache.set(key, data)
          setVals(data)
        } else {
          const fallback = ['Error loading']
          cache.set(key, fallback)
          setVals(fallback)
        }
      })
      .catch(() => {
        const fallback = ['Error loading']
        cache.set(key, fallback)
        setVals(fallback)
      })
  }, [options, sources])

  return vals
}
