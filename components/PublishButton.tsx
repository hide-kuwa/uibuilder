'use client'
import React,{useState} from 'react'
import { useEditorState } from '../src/store'
const PublishButton:React.FC=()=>{
  const{tree}=useEditorState()
  const[edge,setEdge]=useState<string|null>(null)
  const handlePublish=async()=>{
    const token=localStorage.getItem('token')
    if(!token){
      window.location.href='/login'
      return
    }
    try{
      const res=await fetch('/api/pages/home/publish',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({author:'demo',json:tree})})
      if(!res.ok){
        alert('Publish failed')
        return
      }
      const data=await res.json()
      alert(JSON.stringify(data))
      const edgeRes=await fetch('/edge-config/home')
      if(edgeRes.ok){
        const txt=await edgeRes.text()
        setEdge(txt)
      }
    }catch(err){
      alert('Publish error')
    }
  }
  return(
    <>
      <button onClick={handlePublish} className="px-4 py-2 bg-blue-500 text-white rounded">Publish</button>
      {edge&&(
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-4 max-w-lg">
            <pre className="overflow-auto max-h-96">{edge}</pre>
            <button onClick={()=>setEdge(null)} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Close</button>
          </div>
        </div>
      )}
    </>
  )
}
export default PublishButton
