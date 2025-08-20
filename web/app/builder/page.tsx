import Canvas from '../../components/Canvas'
import Library from '../../components/Library'
import Inspector from '../../components/Inspector'

export default function BuilderPage() {
  return (
    <div className="flex h-screen">
      <div className="w-60 border-r overflow-y-auto"><Library/></div>
      <div className="flex-1 overflow-auto"><Canvas/></div>
      <div className="w-80 border-l overflow-y-auto"><Inspector/></div>
    </div>
  )
}
