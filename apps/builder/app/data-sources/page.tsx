'use client'
import { useEffect, useState } from 'react'
type DS = { key:string; url:string; ttlSec?:number }

export default function DataSourcesPage(){
  const [list,setList] = useState<DS[]>([])
  const [draft,setDraft] = useState<DS>({ key:'prefStats', url:'https://example.com/prefs.json', ttlSec:3600 })

  const load = async ()=>{ const r=await fetch('/api/ds'); if(r.ok){ const j=await r.json(); setList(j.items||[]) } }
  const save = async ()=>{
    const r=await fetch('/api/ds',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({ item:draft })})
    if (r.status===409) { alert('同じ key のデータソースが存在します'); return }
    if (!r.ok) { alert('保存に失敗しました'); return }
    setDraft({ key:'', url:'', ttlSec:3600 }); await load()
  }
  const del  = async (key:string)=>{ const r=await fetch(`/api/ds?key=${encodeURIComponent(key)}`,{method:'DELETE'}); if(r.ok) await load() }

  useEffect(()=>{ load() },[])

  return (
    <div style={{padding:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
      <div>
        <h3>Data Sources</h3>
        <ul style={{listStyle:'none', padding:0, display:'grid', gap:8}}>
          {list.map(ds=>(
            <li key={ds.key} style={{border:'1px solid #eee', borderRadius:8, padding:8, display:'grid', gridTemplateColumns:'1fr auto', gap:8}}>
              <div>
                <div><b>{ds.key}</b></div>
                <div style={{fontSize:12, color:'#666'}}>{ds.url}</div>
                <div style={{fontSize:12, color:'#666'}}>ttl: {ds.ttlSec ?? '-'}</div>
              </div>
              <div style={{display:'flex', gap:8}}>
                <button onClick={()=>setDraft(ds)}>編集</button>
                <button onClick={()=>del(ds.key)} style={{color:'#c00'}}>削除</button>
              </div>
            </li>
          ))}
          {list.length===0 && <li style={{color:'#888'}}>（登録なし）</li>}
        </ul>
      </div>

      <div>
        <h3>編集</h3>
        <div style={{display:'grid', gap:8}}>
          <label>key<input value={draft.key} onChange={e=>setDraft({...draft, key:e.target.value})} /></label>
          <label>url<input value={draft.url} onChange={e=>setDraft({...draft, url:e.target.value})} /></label>
          <label>ttlSec<input type="number" value={draft.ttlSec??''} onChange={e=>setDraft({...draft, ttlSec: (e.target as HTMLInputElement).value ? Number((e.target as HTMLInputElement).value) : undefined})} /></label>
          <button onClick={save} style={{background:'#111', color:'#fff', borderRadius:8, padding:'8px 12px'}}>保存</button>
        </div>
      </div>
    </div>
  )
}
