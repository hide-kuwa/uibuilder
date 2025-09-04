import Link from 'next/link'

export default function PageEditor({ params }: { params: { id: string } }) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Page Editor</h1>
        <Link href={`/builder/pages/${params.id}/preview`} className="px-3 py-2 rounded-lg border">Preview</Link>
      </div>
      <p className="text-sm text-zinc-500">Editing page: {params.id}</p>
    </div>
  )
}
