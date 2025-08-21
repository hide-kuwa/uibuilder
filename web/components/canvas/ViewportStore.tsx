'use client'
import React,{createContext,useContext,useState} from 'react'
type VP = { zoom:number; x:number; y:number; showGrid:boolean; showRulers:boolean; snapOn:boolean }
const Ctx = createContext<{
  vp:VP; setZoom:(z:number)=>void; panBy:(dx:number,dy:number)=>void;
  toggle:(k:'showGrid'|'showRulers'|'snapOn')=>void;
} | null>(null)
export const ViewportProvider:React.FC<{children:React.ReactNode}> = ({children})=>{
  const [vp,set] = useState<VP>({zoom:1,x:0,y:0,showGrid:false,showRulers:false,snapOn:true})
  const setZoom = (z:number)=> set(s=>({...s, zoom:Math.min(4,Math.max(0.25,z))}))
  const panBy = (dx:number,dy:number)=> set(s=>({...s, x:s.x+dx, y:s.y+dy}))
  const toggle = (k:any)=> set(s=>({...s,[k]:!s[k]}))
  return <Ctx.Provider value={{vp,setZoom,panBy,toggle}}>{children}</Ctx.Provider>
}
export const useViewport = ()=>{ const c=useContext(Ctx); if(!c) throw new Error('vp'); return c }
