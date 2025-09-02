import type { Metadata } from 'next'

export const runtime = 'edge'
export const dynamic = 'force-static' // キャッシュしてOK（パラメータベース）

export async function generateMetadata({ params }: { params: { pe: string } }): Promise<Metadata> {
  const pe = params.pe
  const img = `/api/og/${pe}`
  return {
    title: '地図コレ – 私の日本地図',
    description: '行きたい・行った・住んだを色でシェア！',
    openGraph: {
      title: '地図コレ – 私の日本地図',
      description: '行きたい・行った・住んだを色でシェア！',
      images: [{ url: img, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: '地図コレ – 私の日本地図',
      description: '行きたい・行った・住んだを色でシェア！',
      images: [img],
    },
  }
}

export default function ShareEnumPage({ params }: { params: { pe: string } }) {
  const pe = params.pe
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-2xl font-bold">共有ページ（列挙）</h1>
      <img src={`/api/og/${pe}`} alt="OG Preview" className="w-[600px] rounded-xl border shadow" />
      <a href={`/travel/demo?pe=${pe}`} className="px-4 py-2 border rounded">アプリで開く</a>
    </div>
  )
}

