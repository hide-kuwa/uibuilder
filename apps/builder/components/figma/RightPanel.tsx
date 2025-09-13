'use client'
import { useFigmaStore } from '../../lib/figma/store'
import type { Node } from '../../lib/figma/model'
import MotionPanel from './MotionPanel'
import ThemePanel from '../ThemePanel'

function NumberInput({ label, value, onChange }:{
  label:string; value:number; onChange:(n:number)=>void
}) {
  return (
    <label className="flex items-center justify-between py-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <input type="number" className="w-28 rounded border border-gray-200 px-2 py-1 text-right"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e)=>onChange(Number(e.target.value))}/>
    </label>
  )
}

function ColorInput({ label, value, onChange }:{
  label: string; value?: string; onChange:(v:string)=>void
}) {
  return (
    <label className="flex items-center justify-between py-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <input
        type="text"
        placeholder="#RRGGBB / rgba()"
        className="w-32 rounded border border-gray-200 px-2 py-1 text-right font-mono text-xs"
        value={value ?? ''}
        onChange={(e)=>onChange(e.target.value)}
      />
    </label>
  )
}

function Slider({ label, value, min=0, max=1, step=0.01, onChange }:{
  label:string; value:number; min?:number; max?:number; step?:number; onChange:(n:number)=>void
}) {
  return (
    <label className="flex items-center gap-2 py-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <input
        type="range" min={min} max={max} step={step}
        className="flex-1"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e)=>onChange(Number(e.target.value))}
      />
      <span className="w-10 text-right tabular-nums">{Math.round((value ?? 0)*100)}</span>
    </label>
  )
}

export default function RightPanel() {
  const selected = useFigmaStore((s)=>s.selectedNode)
  const updateNode = useFigmaStore((s)=>s.updateNode)
  const updateNodeStyle = useFigmaStore((s)=>s.updateNodeStyle)
  const setNodeMotion = useFigmaStore((s)=>s.setNodeMotion)
  const wrapInStack = useFigmaStore((s)=>s.wrapInStack)
  const setStackProps = useFigmaStore((s)=>s.setStackProps)

  if (!selected) {
    return <div className="p-4 text-sm text-gray-500">
      <div className="font-semibold text-gray-700 mb-2">Properties</div>
      <p>No selection</p>
    </div>
  }
  return (
    <div className="p-4 space-y-4">
      <div>
        <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Selection</div>
        <div className="text-sm font-medium text-gray-800">
          {selected.name || selected.type} <span className="text-gray-400">({selected.type})</span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-xs uppercase tracking-wider text-gray-400">Position</div>
        <NumberInput label="X" value={selected.x} onChange={(n)=>updateNode(selected.id,{x:n})}/>
        <NumberInput label="Y" value={selected.y} onChange={(n)=>updateNode(selected.id,{y:n})}/>
      </div>
      <div className="space-y-1">
        <div className="text-xs uppercase tracking-wider text-gray-400">Size</div>
        <NumberInput label="W" value={selected.width} onChange={(n)=>updateNode(selected.id,{width:n})}/>
        <NumberInput label="H" value={selected.height} onChange={(n)=>updateNode(selected.id,{height:n})}/>
      </div>

      {/* Stack wrap / props */}
      {selected.type === 'STACK' ? (
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wider text-gray-400">Stack</div>
          <label className="flex items-center justify-between py-1 text-sm">
            <span className="text-gray-500">Direction</span>
            <select
              className="w-28 rounded border border-gray-200 px-2 py-1 text-sm"
              value={(selected as any).direction}
              onChange={(e)=>setStackProps(selected.id,{direction: e.target.value as any})}
            >
              <option value="H">Horizontal</option>
              <option value="V">Vertical</option>
            </select>
          </label>
          <NumberInput label="Spacing" value={(selected as any).spacing ?? 0} onChange={(n)=>setStackProps(selected.id,{spacing:n})}/>
          <div className="grid grid-cols-2 gap-1">
            <NumberInput label="Pad T" value={(selected as any).padding?.t ?? 0} onChange={(n)=>setStackProps(selected.id,{padding:{...((selected as any).padding||{t:0,r:0,b:0,l:0}),t:n}})}/>
            <NumberInput label="Pad R" value={(selected as any).padding?.r ?? 0} onChange={(n)=>setStackProps(selected.id,{padding:{...((selected as any).padding||{t:0,r:0,b:0,l:0}),r:n}})}/>
            <NumberInput label="Pad B" value={(selected as any).padding?.b ?? 0} onChange={(n)=>setStackProps(selected.id,{padding:{...((selected as any).padding||{t:0,r:0,b:0,l:0}),b:n}})}/>
            <NumberInput label="Pad L" value={(selected as any).padding?.l ?? 0} onChange={(n)=>setStackProps(selected.id,{padding:{...((selected as any).padding||{t:0,r:0,b:0,l:0}),l:n}})}/>
          </div>
          <label className="flex items-center justify-between py-1 text-sm">
            <span className="text-gray-500">Align</span>
            <select
              className="w-28 rounded border border-gray-200 px-2 py-1 text-sm"
              value={(selected as any).align}
              onChange={(e)=>setStackProps(selected.id,{align: e.target.value as any})}
            >
              <option value="START">Start</option>
              <option value="CENTER">Center</option>
              <option value="END">End</option>
              <option value="SPACE_BETWEEN">Space Between</option>
            </select>
          </label>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider text-gray-400">AutoLayout-lite</div>
          <div className="flex gap-2">
            <button
              className="rounded bg-gray-900 text-white px-2 py-1 text-xs"
              onClick={()=>wrapInStack('H')}
              title="Wrap selection into Horizontal Stack"
            >Wrap in Stack (H)</button>
            <button
              className="rounded bg-gray-900 text-white px-2 py-1 text-xs"
              onClick={()=>wrapInStack('V')}
              title="Wrap selection into Vertical Stack"
            >Wrap in Stack (V)</button>
          </div>
        </div>
      )}
      {/* Style */}
      <div className="space-y-1 mt-4">
        <div className="text-xs uppercase tracking-wider text-gray-400">Style</div>
        <ColorInput label="Fill" value={(selected as any).style?.fill as any} onChange={(v)=>updateNodeStyle(selected.id,{ fill:v })}/>
        <ColorInput label="Stroke" value={(selected as any).style?.stroke} onChange={(v)=>updateNodeStyle(selected.id,{ stroke:v })}/>
        <NumberInput label="Stroke W" value={(selected as any).style?.strokeWidth ?? 1} onChange={(n)=>updateNodeStyle(selected.id,{ strokeWidth:n })}/>
        <div className="flex items-center justify-between gap-2">
          <NumberInput label="Radius" value={typeof (selected as any).style?.radius === 'number' ? (selected as any).style?.radius : 0} onChange={(n)=>updateNodeStyle(selected.id,{ radius:n as any })}/>
          <button
            className="rounded bg-gray-100 px-2 py-1 text-xs"
            title="テーマの半径トークンを適用 (radius.base)"
            onClick={() => {
              const current = typeof (selected as any).style?.radius === 'number' ? (selected as any).style?.radius : 8
              updateNodeStyle(selected.id, { radius: { token: 'radius.base', fallback: `${current}px` } as any })
            }}
          >Use theme</button>
        </div>
        <Slider label="Opacity" value={(selected as any).style?.opacity ?? 1} min={0} max={1} step={0.01}
          onChange={(n)=>updateNodeStyle(selected.id,{ opacity:n })}/>
        {/* Shadow */}
        <div className="grid grid-cols-2 gap-2">
          <NumberInput label="Shadow X" value={(selected as any).style?.shadow?.x ?? 0} onChange={(n)=>updateNodeStyle(selected.id,{ shadow:{ ...(((selected as any).style?.shadow)||{x:0,y:0,blur:0,spread:0,color:'rgba(0,0,0,.2)'}), x:n } })}/>
          <NumberInput label="Shadow Y" value={(selected as any).style?.shadow?.y ?? 0} onChange={(n)=>updateNodeStyle(selected.id,{ shadow:{ ...(((selected as any).style?.shadow)||{x:0,y:0,blur:0,spread:0,color:'rgba(0,0,0,.2)'}), y:n } })}/>
          <NumberInput label="Blur" value={(selected as any).style?.shadow?.blur ?? 0} onChange={(n)=>updateNodeStyle(selected.id,{ shadow:{ ...(((selected as any).style?.shadow)||{x:0,y:0,blur:0,spread:0,color:'rgba(0,0,0,.2)'}), blur:n } })}/>
          <NumberInput label="Spread" value={(selected as any).style?.shadow?.spread ?? 0} onChange={(n)=>updateNodeStyle(selected.id,{ shadow:{ ...(((selected as any).style?.shadow)||{x:0,y:0,blur:0,spread:0,color:'rgba(0,0,0,.2)'}), spread:n } })}/>
        </div>
        <ColorInput label="Shadow Color" value={(selected as any).style?.shadow?.color}
          onChange={(v)=>updateNodeStyle(selected.id,{ shadow:{ ...(((selected as any).style?.shadow)||{x:0,y:0,blur:0,spread:0,color:'rgba(0,0,0,.2)'}), color:v } })}/>
      </div>

      {/* Motion (CSS Transition) */}
      <div className="space-y-1 mt-4">
        <div className="text-xs uppercase tracking-wider text-gray-400">Motion</div>
        <NumberInput label="Duration(ms)" value={(selected as any).motion?.durationMs ?? 160} onChange={(n)=>setNodeMotion(selected.id,{ durationMs:n } as any)}/>
        <NumberInput label="Delay(ms)" value={(selected as any).motion?.delayMs ?? 0} onChange={(n)=>setNodeMotion(selected.id,{ delayMs:n } as any)}/>
        <label className="flex items-center justify-between py-1 text-sm">
          <span className="text-gray-500">Easing</span>
          <input type="text" className="w-32 rounded border border-gray-200 px-2 py-1 text-right text-xs font-mono"
            placeholder="ease|linear|ease-in-out|cubic-bezier(...)"
            value={(selected as any).motion?.easing ?? 'ease-out'}
            onChange={(e)=>setNodeMotion(selected.id,{ easing:e.target.value } as any)}/>
        </label>
      </div>

      <MotionPanel />
      <ThemePanel />
    </div>
  )
}
