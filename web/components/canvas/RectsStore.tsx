'use client'
import React,{createContext,useContext,useRef,useState,useEffect} from 'react'
export type R = {x:number;y:number;w:number;h:number}
type MapT = Record<string,R>
const Ctx = createContext<{
  rects:MapT; setRect:(id:string, r:R)=>void
} | null>(null)
export const RectsProvider:React.FC<{children:React.ReactNode}> = ({children})=>{
  const [rects,setRects] = useState<MapT>({})
  const setRect = (id:string, r:R)=> setRects(m=>({...m,[id]:r}))
  return <Ctx.Provider value={{rects,setRect}}>{children}</Ctx.Provider>
}
export const useRects = ()=>{const c=useContext(Ctx); if(!c) throw new Error('rects'); return c}
