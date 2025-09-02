'use client'
export default function ApplyBar({onReplace,onAppend,onRemove,onReplaceAll,onAppendAll,onRemoveAll}:{[k:string]:()=>void}){
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-background/80 backdrop-blur border-t px-3 py-2">
      <div className="flex flex-wrap gap-2">
        <button className="px-3 py-1 rounded border bg-primary text-primary-foreground" onClick={onReplace}>Apply to Selection (Replace)</button>
        <button className="px-3 py-1 rounded border" onClick={onAppend}>Append to Selection</button>
        <button className="px-3 py-1 rounded border" onClick={onRemove}>Remove from Selection</button>
        <span className="mx-2 opacity-60">｜</span>
        <button className="px-3 py-1 rounded border" onClick={onReplaceAll}>Replace All</button>
        <button className="px-3 py-1 rounded border" onClick={onAppendAll}>Append All</button>
        <button className="px-3 py-1 rounded border" onClick={onRemoveAll}>Remove All</button>
      </div>
    </div>
  )
}
