'use client'
import useSWR from 'swr'
import dynamic from 'next/dynamic'
import { RuntimeProvider } from '@chizu/renderer'

const fetcher = (u: string) => fetch(u).then((r) => r.json())

export default function Page({ params, searchParams }: { params: { id: string }, searchParams: Record<string, string | undefined> }) {
  const { data } = useSWR<Record<string, string>>('/generated/manifest.json', fetcher, { refreshInterval: 1000 })
  const file = data?.[params.id]
  const C = file
    ? (dynamic(() => import(`../../generated/pages/${file}`).then((m) => (m as any).default), { ssr: false }) as any)
    : (() => null)
  const prefCode = searchParams?.pref ?? '13'
  const PREFS: Record<string,{ name:string; population:number }> = {
    '01': { name: '北海道', population: 5224614 },
    '13': { name: '東京都', population: 14047594 }
  }
  const HOVER_PRESETS = {
    subtleLift: {
      base: { transform:'translateY(0px)' },
      hover: { transform:'translateY(-2px)', boxShadow:'0 4px 12px rgba(0,0,0,0.08)' },
      transition: 'transform .15s ease, box-shadow .15s ease'
    },
    glow: {
      base: { boxShadow:'0 0 0 rgba(0,0,0,0)' },
      hover: { boxShadow:'0 0 0 4px rgba(99,102,241,0.2)' },
      transition: 'box-shadow .15s ease'
    }
  }

  // aggregated server-side fetch with TTL cache
  const { data: apiData } = useSWR<Record<string,any>>('/api/ds-fetch', fetcher, { refreshInterval: 5000, revalidateOnFocus: false })
  return (
    <RuntimeProvider value={{ page: { prefCode }, api: { prefStats: PREFS, hoverPresets: HOVER_PRESETS, ...(apiData||{}) } }}>
      {file ? (
        <C />
      ) : (
        <div style={{ padding: 12 }}>
          ページがまだ生成されていません（または削除済み）。
          <br />
          Builderで保存してください。→{' '}
          <a href="http://localhost:3000/">Builderへ</a>
        </div>
      )}
    </RuntimeProvider>
  )
}
