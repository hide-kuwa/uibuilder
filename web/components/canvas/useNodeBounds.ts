'use client'
import { useCallback } from 'react'

export function useNodeBounds(){
  const rectFor = useCallback((id:string)=>{
    const el = document.querySelector(`[data-node-id="${id}"]`) as HTMLElement|null
    if(!el) return null
    const r = el.getBoundingClientRect()
    const style = (el as any).style || {}
    return { left:r.left, top:r.top, width:r.width, height:r.height, right:r.right, bottom:r.bottom, style }
  },[])
  const siblingRects = useCallback((id:string)=>{
    const parent = document.querySelector(`[data-node-id="${id}"]`)?.parentElement
    if(!parent) return []
    return Array.from(parent.querySelectorAll('[data-node-id]'))
      .filter(el => (el as HTMLElement).dataset.nodeId !== id)
      .map(el => (el as HTMLElement).getBoundingClientRect())
  },[])
  return { rectFor, siblingRects }
}
