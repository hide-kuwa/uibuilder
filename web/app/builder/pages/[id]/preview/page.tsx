'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function PagePreview({ params }: { params: { id: string } }) {
  const [published, setPublished] = useState(false)
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Page Preview</h1>
        <button
          onClick={() => setPublished(true)}
          className="px-3 py-2 rounded-lg border bg-black text-white"
        >
          Publish
        </button>
      </div>
      <p className="text-sm text-zinc-500">Previewing page: {params.id}</p>
      {published && (
        <p className="text-sm text-green-600">Published!</p>
      )}
      <Link href={`/builder/pages/${params.id}/edit`} className="text-blue-600 underline">
        Back to edit
      </Link>
    </div>
  )
}
