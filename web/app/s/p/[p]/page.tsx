import type { Metadata } from 'next'
export const runtime = 'edge'
export const dynamic = 'force-static'

export async function generateMetadata({ params }: { params: { p: string } }): Promise<Metadata> {
  const p = params.p
  const img = `/api/og/p/${p}`
  return {
    title: '地図コレ – 日本地図（シンプル）',
    openGraph: { images: [{ url: img, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', images: [img] },
  }
}

export default function ShareBoolPage({ params }: { params: { p: string } }) {
  const p = params.p
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-2xl font-bold">共有ページ（シンプル）</h1>
      <img src={`/api/og/p/${p}`} alt="OG Preview" className="w-[600px] rounded-xl border shadow" />
      <a href={`/travel/demo?p=${p}`} className="px-4 py-2 border rounded">アプリで開く</a>
    </div>
  )
}

