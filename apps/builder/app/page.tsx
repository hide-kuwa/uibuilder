'use client'
import { useState } from 'react'
import * as REG from '@chizu/registry'
import type { Page, ComponentNode, Frame } from '@chizu/types'

const FRAME: Frame = { id: 'frame-basic', name: 'Basic', slots: [{name:'header'},{name:'sidebar'},{name:'content',required:true},{name:'footer'}] }
const INITIAL: Page = { id: 'map-home', title: '地図コレTOP', frameId: 'frame-basic', content: [{ id:'hero', type:'Hero', props:{ title:'地図で集める旅' } }], slotAssignments: { header:[{id:'nav',type:'TopNav'}], sidebar:[{id:'list',type:'PrefList'}] } }

const CATALOG: Array<{type:string; label:string; defaultProps?:Record<string,any>}> = [
  { type:'Text', label:'Text', defaultProps:{ text:'テキスト' } },
  { type:'Image', label:'Image', defaultProps:{ src:'', alt:'' } },
  { type:'Hero', label:'Hero', defaultProps:{ title:'タイトル' } },
  { type:'TopNav', label:'TopNav' },
  { type:'PrefList', label:'PrefList' }
]

function PropsEditor({ node, onChange }: { node: ComponentNode; onChange: (k: string, v: any) => void }){
  const schema: any = (REG as any).getSchema?.(node.type)
  if(!schema?.properties) return <div>Propsなし</div>
  return (
    <div style={{display:'grid', gap:10}}>
      {Object.entries(schema.properties).map(([key, spec]: any)=> (
        <div key={key}>
          <div style={{fontSize:12,color:'#666'}}>{key}</div>
          <input
            value={(node.props as any)?.[key] ?? spec.default ?? ''}
            onChange={e=>onChange(key, (e.target as HTMLInputElement).value)}
            style={{width:'100%', padding:8, border:'1px solid #ddd', borderRadius:8}}
          />
        </div>
      ))}
    </div>
  )
}

export default function Builder() {
  const [page,setPage] = useState<Page>(INITIAL)
  const [sel,setSel] = useState<string|undefined>(page.content[0]?.id)
  const [history,setHistory] = useState<Page[]>([])
  const push = (next: Page) => { setHistory(h=>[...h.slice(-49), page]); setPage(next) }

  const addNode = (type:string) => {
    const id = `${type.toLowerCase()}_${Math.random().toString(36).slice(2,7)}`
    const def = CATALOG.find(c=>c.type===type)?.defaultProps ?? {}
    const n: ComponentNode = { id, type, props: def }
    push({ ...page, content: [...page.content, n] })
    setSel(id)
  }

  const updateProp = (k:string, v:string) => {
    push({ ...page, content: page.content.map(n => n.id===sel ? ({ ...n, props: { ...(n.props??{}), [k]: v } }) : n ) })
  }

  const removeSel = ()=> sel && push({ ...page, content: page.content.filter(n=>n.id!==sel) })
  const moveSel = (dir:-1|1)=>{
    const i = page.content.findIndex(n=>n.id===sel); if(i<0) return
    const arr=[...page.content]; const j=i+dir; if(j<0||j>=arr.length) return
    ;[arr[i],arr[j]]=[arr[j],arr[i]]; push({ ...page, content: arr })
  }
  const undo = ()=>{ const prev = history.at(-1); if(!prev) return; setHistory(h=>h.slice(0,-1)); setPage(prev); setSel(prev.content[0]?.id) }

  const selected = page.content.find(n=>n.id===sel)

  const save = async () => {
    await fetch('/api/save', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ page, frame: FRAME }) })
    alert('Saved and generated. Open /map-home in Preview app.')
  }

  return (
    <div style={{display:'grid', gridTemplateColumns:'260px 1fr 320px', height:'100vh'}}>
      <div style={{borderRight:'1px solid #eee', padding:12}}>
        <h3 style={{margin:'8px 0'}}>Components</h3>
        <div style={{display:'grid', gap:8}}>
          {CATALOG.map(c => (
            <button key={c.type} onClick={()=>addNode(c.type)} style={{padding:'8px 10px', border:'1px solid #ddd', borderRadius:8, background:'#fff', textAlign:'left'}}>{c.label}</button>
          ))}
        </div>
        <div style={{marginTop:16}}>
          <button onClick={save} style={{width:'100%', padding:'10px', borderRadius:8, background:'#111', color:'#fff'}}>保存してコード生成</button>
        </div>
      </div>
      <div style={{padding:12}}>
        <h3 style={{margin:'8px 0'}}>Canvas (content)</h3>
        <div style={{display:'flex', gap:8, margin:'8px 0'}}>
          <button onClick={undo}>Undo</button>
          <button onClick={()=>moveSel(-1)} disabled={!sel}>↑</button>
          <button onClick={()=>moveSel(1)} disabled={!sel}>↓</button>
          <button onClick={removeSel} disabled={!sel}>削除</button>
        </div>
        <ul style={{listStyle:'none', padding:0, margin:0, display:'grid', gap:8}}>
          {page.content.map(n => (
            <li key={n.id} onClick={()=>setSel(n.id)} style={{padding:'10px', border:'2px solid ' + (n.id===sel ? '#111' : '#ddd'), borderRadius:10, background:'#fafafa', cursor:'pointer'}}>
              <div style={{fontSize:12,color:'#666'}}>{n.type}</div>
              <div style={{fontWeight:600}}>{n.type==='Text' ? n.props?.text : n.type==='Hero' ? n.props?.title : `[${n.type}]`}</div>
            </li>
          ))}
        </ul>
      </div>
      <div style={{borderLeft:'1px solid #eee', padding:12}}>
        <h3 style={{margin:'8px 0'}}>Inspector</h3>
        {selected ? (
          <div style={{display:'grid', gap:10}}>
            <div><div style={{fontSize:12,color:'#666'}}>id</div><div>{selected.id}</div></div>
            <div><div style={{fontSize:12,color:'#666'}}>type</div><div>{selected.type}</div></div>
            <PropsEditor node={selected} onChange={(k,v)=>updateProp(k,v)} />
          </div>
        ) : <div>要素を選択してください</div>}
      </div>
    </div>
  )
}
