import Link from 'next/link'

export default function LayoutBuilderPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Layout Builder</h1>
      <p className="text-sm text-zinc-500">Editing layout template: {params.id}</p>
      <Link href={`/builder/pages/${params.id}/edit`} className="text-blue-600 underline">
        Edit pages using this layout
      </Link>
    </div>
  )
}
