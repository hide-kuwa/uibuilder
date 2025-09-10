import { DevCanvas } from '../../components/figma/Canvas'
import { useFigmaDevStore } from '../../lib/figma/store'

export default function FigmaDevPage() {
  if (process.env.NEXT_PUBLIC_FIGMA !== '1') {
    return null
  }
  const addNode = useFigmaDevStore((s) => s.addNode)
  const addText = () => {
    const id = `node-${Date.now()}`
    addNode({ id, type: 'TEXT', x: 40, y: 40, w: 120, h: 24, text: 'Text' })
  }
  return (
    <div className="flex h-screen">
      <div className="w-48 border-r p-2">
        <button onClick={addText} className="mb-2 rounded border px-2 py-1 text-sm">
          + Text
        </button>
      </div>
      <DevCanvas />
      <div className="w-60 border-l" />
    </div>
  )
}
