import dynamic from 'next/dynamic'

export const metadata = { title: 'Figma Dev (v0 placeholder)' }

const FigmaDev = dynamic(() => import('../../../components/figma/FigmaDev'), { ssr: false })

export default function Page() {
  const enabled = process.env.NEXT_PUBLIC_FIGMA === '1'
  if (!enabled) {
    return (
      <div className="p-6 text-sm text-gray-600">
        <h1 className="text-lg font-semibold mb-2">Figma Dev is disabled</h1>
        <p>Set <code>NEXT_PUBLIC_FIGMA=1</code> to enable this route.</p>
      </div>
    )
  }
  return <FigmaDev />
}

