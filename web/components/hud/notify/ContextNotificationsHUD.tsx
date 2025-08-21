'use client'
import React, {useEffect, useState} from 'react'
type Note = { id:string; source:string; channel?:string; text:string; ts:number }

export default function ContextNotificationsHUD(){
  const [notes, setNotes] = useState<Note[]>([])
  useEffect(()=>{
    let ws:WebSocket|undefined
    try {
      const proto = location.protocol === 'https:' ? 'wss' : 'ws'
      const wsUrl = `${proto}://${location.host}/ws/notifications`
      ws = new WebSocket(wsUrl)
      ws.onmessage = (ev)=> {
        const n = JSON.parse(ev.data) as Note
        setNotes(s=> [n, ...s].slice(0,3))
        setTimeout(()=> setNotes(s=> s.filter(x=> x.id !== n.id)), 7000)
      }
    } catch {}
    return ()=> ws?.close()
  },[])
  return (
    <div className="pointer-events-none absolute left-2 bottom-2 flex flex-col gap-2">
      {notes.map(n=>(
        <div key={n.id} className="pointer-events-auto bg-white/90 backdrop-blur rounded-lg shadow p-2 w-80">
          <div className="text-[10px] text-gray-500">{n.source} {n.channel ? `#${n.channel}`:''}</div>
          <div className="text-sm">{n.text}</div>
        </div>
      ))}
    </div>
  )
}
