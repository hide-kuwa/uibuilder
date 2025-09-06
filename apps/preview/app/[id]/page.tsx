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
  return (
    <RuntimeProvider value={{ page: { prefCode } }}>
      {file ? <C /> : <div style={{ padding: 12 }}>生成待ち…（Builderで保存してね）</div>}
    </RuntimeProvider>
  )
}
