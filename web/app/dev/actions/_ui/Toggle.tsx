'use client'
export default function Toggle({checked,onChange,label,id}:{checked:boolean;onChange:(v:boolean)=>void;label:string;id?:string}) {
  return (
    <label className="inline-flex items-center gap-2 text-xs border rounded px-2 py-1 cursor-pointer select-none">
      <input type="checkbox" className="accent-primary" checked={checked} onChange={e=>onChange(e.target.checked)} id={id}/>
      <span>{label}</span>
    </label>
  )
}
