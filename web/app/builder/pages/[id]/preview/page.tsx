import type { Metadata } from 'next'
import Link from 'next/link'
import { readFile } from 'fs/promises'
import path from 'path'

async function loadMeta(id: string) {
  try {
    const file = path.join(process.cwd(), 'data/pages', `${id}.json`)
    const json = await readFile(file, 'utf8')
    const data = JSON.parse(json)
    return data.meta || {}
  } catch {
    return {}
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const meta = await loadMeta(params.id)
  const og = meta.ogImage?.mode === 'custom' ? meta.ogImage.url : `/api/og?pageId=${params.id}`
  return {
    title: meta.title || 'Page Preview',
    description: meta.description || undefined,
    openGraph: og ? { images: [og] } : undefined,
  }
}

export default async function PagePreview({ params }: { params: { id: string } }) {
  const meta = await loadMeta(params.id)
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{meta.title || 'Page Preview'}</h1>
      </div>
      <p className="text-sm text-zinc-500">Previewing page: {params.id}</p>
      <Link href={`/builder/pages/${params.id}/edit`} className="text-blue-600 underline">
        Back to edit
      </Link>
    </div>
  )
}
