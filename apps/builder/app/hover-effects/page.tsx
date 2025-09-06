'use client'
import { useEffect, useState } from 'react'
type Preset = { id:string; name:string; base?:any; hover?:any; transition?:string }

export default function HoverEffects() {
  const [list,setList] = useState<Preset[]>([])
  const [draft,setDraft] = useState<Preset>({ id:'subtleLift', name:'Subtle Lift', base:{ transform:'translateY(0px)' }, hover:{ transform:'translateY(-2px)', boxShadow:'0 4px 12px rgba(0,0,0,0.08)' }, transition:'transform .15s ease, box-shadow .15s ease' })
  const load = async ()=>{ const r = await fetch('/api/hover'); if(r.ok){ const j = await r.json(); setList(j.items||[]) } }
  const save = async ()=>{ const r = await fetch('/api/hover', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ preset:draft }) }); if(r.ok){ await load() } }
  const del = async (id:string)=>{ const r = await fetch(`/api/hover?id=${encodeURIComponent(id)}`, { method:'DELETE' }); if(r.ok){ await load() } }
  useEffect(()=>{ load() },[])
  return (
    <div style={{padding:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
      <div>
        <h3>Presets</h3>
        <ul style={{listStyle:'none', padding:0, display:'grid', gap:8}}>
          {list.map(p=>(
            <li key={p.id} style={{border:'1px solid #eee', borderRadius:8, padding:8, display:'grid', gridTemplateColumns:'1fr auto', gap:8}}>
              <div>
                <div><b>{p.id}</b> — {p.name}</div>
                <div style={{fontSize:12, color:'#666'}}>transition: {p.transition||'(none)'}</div>
              </div>
              <div style={{display:'flex', gap:8}}>
                <button onClick={()=>setDraft(p)}>編集</button>
                <button onClick={()=>del(p.id)} style={{color:'#c00'}}>削除</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3>編集</h3>
        <div style={{display:'grid', gap:8}}>
          <label>ID<input value={draft.id} onChange={e=>setDraft({...draft, id:e.target.value})} /></label>
          <label>Name<input value={draft.name} onChange={e=>setDraft({...draft, name:e.target.value})} /></label>
          <label>Transition<input value={draft.transition||''} onChange={e=>setDraft({...draft, transition:e.target.value})} /></label>
          <label>Base(JSON)<textarea rows={4} value={JSON.stringify(draft.base||{}, null, 2)} onChange={e=>{ try{ setDraft({...draft, base: JSON.parse(e.target.value||'{}')}) }catch{} }} /></label>
          <label>Hover(JSON)<textarea rows={4} value={JSON.stringify(draft.hover||{}, null, 2)} onChange={e=>{ try{ setDraft({...draft, hover: JSON.parse(e.target.value||'{}')}) }catch{} }} /></label>
          <button onClick={save} style={{background:'#111', color:'#fff', borderRadius:8, padding:'8px 12px'}}>保存</button>
        </div>
      </div>
    </div>
  )
}

